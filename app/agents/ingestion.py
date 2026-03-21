import json
import os
import re

from ai_sdk import generate_text
from app.agents.base import get_model, is_mock

IGNORED_DIRS = {
    ".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build",
    ".next", ".nuxt", ".cache", ".tox", ".mypy_cache", ".pytest_cache",
    "vendor", "target", "out", "eggs", "*.egg-info",
}

IGNORED_EXTENSIONS = {
    ".lock", ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".woff",
    ".woff2", ".ttf", ".eot", ".mp3", ".mp4", ".zip", ".tar", ".gz",
    ".pyc", ".pyo", ".so", ".dll", ".exe", ".bin", ".dat",
}

CONFIG_FILES = {
    "pyproject.toml", "setup.py", "setup.cfg", "requirements.txt",
    "package.json", "tsconfig.json", "go.mod", "Cargo.toml",
    "Gemfile", "pom.xml", "build.gradle", "Makefile", "Dockerfile",
    "docker-compose.yml", "docker-compose.yaml", ".env.example",
}

FRAMEWORK_HINTS = {
    "pyproject.toml": {"fastapi": "fastapi", "django": "django", "flask": "flask"},
    "package.json": {"next": "nextjs", "react": "react", "vue": "vue", "express": "express"},
    "Cargo.toml": {"actix": "actix", "rocket": "rocket", "axum": "axum"},
    "go.mod": {"gin": "gin", "echo": "echo", "fiber": "fiber"},
}

LANGUAGE_MAP = {
    "pyproject.toml": "python", "setup.py": "python", "requirements.txt": "python",
    "package.json": "javascript/typescript", "tsconfig.json": "typescript",
    "go.mod": "go", "Cargo.toml": "rust", "Gemfile": "ruby",
    "pom.xml": "java", "build.gradle": "java/kotlin",
}

ENTRY_POINT_PATTERNS = [
    "main.py", "app.py", "server.py", "index.py", "manage.py",
    "index.ts", "index.js", "app.ts", "app.js", "server.ts", "server.js",
    "main.go", "main.rs", "Program.cs",
]


def _extract_json(text: str) -> str:
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        return match.group(1).strip()
    return text.strip()


# ---------------------------------------------------------------------------
# Sub-Agent 1: map_file_tree (deterministic, no LLM)
# ---------------------------------------------------------------------------

def map_file_tree(repo_path: str) -> dict:
    file_tree: list[str] = []
    config_files: dict[str, str] = {}
    entry_points: list[str] = []
    detected_language: str | None = None
    detected_framework: str | None = None

    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]
        rel_root = os.path.relpath(root, repo_path)
        if rel_root == ".":
            rel_root = ""

        for fname in sorted(files):
            _, ext = os.path.splitext(fname)
            if ext.lower() in IGNORED_EXTENSIONS:
                continue

            rel_path = os.path.join(rel_root, fname) if rel_root else fname
            file_tree.append(rel_path)

            if fname in CONFIG_FILES:
                try:
                    with open(os.path.join(root, fname), "r", errors="replace") as f:
                        config_files[rel_path] = f.read()
                except OSError:
                    pass

            if fname in ENTRY_POINT_PATTERNS:
                entry_points.append(rel_path)

    for config_name, content in config_files.items():
        base = os.path.basename(config_name)
        if not detected_language and base in LANGUAGE_MAP:
            detected_language = LANGUAGE_MAP[base]
        if base in FRAMEWORK_HINTS:
            for keyword, framework in FRAMEWORK_HINTS[base].items():
                if keyword in content.lower():
                    detected_framework = framework
                    break

    return {
        "language": detected_language or "unknown",
        "framework": detected_framework,
        "file_tree": file_tree,
        "config_files": list(config_files.keys()),
        "entry_points": entry_points,
        "_config_contents": config_files,
    }


# ---------------------------------------------------------------------------
# Sub-Agent 2: analyze_architecture (LLM)
# ---------------------------------------------------------------------------

ARCHITECTURE_PROMPT = (
    "You are a software architecture analyst. Given the following project information, "
    "produce a structured analysis of the codebase architecture.\n\n"
    "LANGUAGE: {language}\nFRAMEWORK: {framework}\n\n"
    "FILE TREE:\n{file_tree}\n\n"
    "KEY FILE CONTENTS:\n{key_files}\n\n"
    "Return a JSON object with these fields:\n"
    '- "modules": array of {{"name": str, "path": str, "responsibility": str}}\n'
    '- "layers": array of layer names (e.g. "API routes", "Service layer", "Database")\n'
    '- "data_flow": string describing how data moves through the system\n'
    '- "entry_points": array of {{"file": str, "description": str}}\n'
    '- "key_patterns": array of architectural patterns detected\n\n'
    "Return ONLY valid JSON, no other text."
)

MOCK_ARCHITECTURE = {
    "modules": [{"name": "api", "path": "app/api/", "responsibility": "HTTP route handlers"}],
    "layers": ["API routes", "Service layer", "Database"],
    "data_flow": "Routes -> Services -> Database client",
    "entry_points": [{"file": "app/main.py", "description": "Application entry point"}],
    "key_patterns": ["layered architecture", "service pattern"],
}


def analyze_architecture(file_tree_data: dict, key_file_contents: dict) -> dict:
    if is_mock():
        return MOCK_ARCHITECTURE

    tree_str = "\n".join(file_tree_data["file_tree"][:200])
    files_str = ""
    for path, content in list(key_file_contents.items())[:50]:
        truncated = content[:3000]
        files_str += f"\n--- {path} ---\n{truncated}\n"

    model = get_model()
    result = generate_text(
        model=model,
        prompt=ARCHITECTURE_PROMPT.format(
            language=file_tree_data["language"],
            framework=file_tree_data.get("framework") or "unknown",
            file_tree=tree_str,
            key_files=files_str,
        ),
    )
    try:
        cleaned = _extract_json(result.text)
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {"error": "Failed to parse architecture analysis", "raw": result.text}


# ---------------------------------------------------------------------------
# Sub-Agent 3: analyze_dependencies (LLM)
# ---------------------------------------------------------------------------

DEPENDENCY_PROMPT = (
    "You are a dependency analyst. Analyze the following project configuration files "
    "and produce a structured dependency report.\n\n"
    "CONFIG FILES:\n{config_contents}\n\n"
    "Return a JSON object with these fields:\n"
    '- "runtime_deps": array of {{"name": str, "version": str, "purpose": str}}\n'
    '- "dev_deps": array of {{"name": str, "version": str, "purpose": str}}\n'
    '- "potential_issues": array of strings describing any concerns\n\n'
    "Return ONLY valid JSON, no other text."
)

MOCK_DEPENDENCIES = {
    "runtime_deps": [{"name": "fastapi", "version": ">=0.115.0", "purpose": "web framework"}],
    "dev_deps": [],
    "potential_issues": ["no pinned versions for some dependencies"],
}


def analyze_dependencies(config_files: dict[str, str]) -> dict:
    if is_mock():
        return MOCK_DEPENDENCIES

    contents_str = ""
    for path, content in config_files.items():
        contents_str += f"\n--- {path} ---\n{content}\n"

    model = get_model()
    result = generate_text(
        model=model,
        prompt=DEPENDENCY_PROMPT.format(config_contents=contents_str),
    )
    try:
        cleaned = _extract_json(result.text)
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {"error": "Failed to parse dependency analysis", "raw": result.text}


# ---------------------------------------------------------------------------
# Orchestrator: analyze_codebase
# ---------------------------------------------------------------------------

def analyze_codebase(repo_path: str) -> dict:
    tree_data = map_file_tree(repo_path)

    key_file_contents: dict[str, str] = {}
    for entry_point in tree_data["entry_points"]:
        full = os.path.join(repo_path, entry_point)
        try:
            with open(full, "r", errors="replace") as f:
                key_file_contents[entry_point] = f.read()
        except OSError:
            pass

    for rel_path in tree_data["file_tree"]:
        if len(key_file_contents) >= 50:
            break
        _, ext = os.path.splitext(rel_path)
        if ext in (".py", ".js", ".ts", ".go", ".rs", ".java", ".kt", ".rb"):
            if rel_path not in key_file_contents:
                full = os.path.join(repo_path, rel_path)
                try:
                    with open(full, "r", errors="replace") as f:
                        key_file_contents[rel_path] = f.read()
                except OSError:
                    pass

    architecture = analyze_architecture(tree_data, key_file_contents)
    config_contents = tree_data.pop("_config_contents", {})
    dependencies = analyze_dependencies(config_contents)

    return {
        "language": tree_data["language"],
        "framework": tree_data.get("framework"),
        "file_tree": tree_data["file_tree"],
        "entry_points": tree_data["entry_points"],
        "architecture": architecture,
        "dependencies": dependencies,
    }


# ---------------------------------------------------------------------------
# Documentation & suggestion helpers
# ---------------------------------------------------------------------------

SUMMARIZE_DOCS_PROMPT = (
    "You are a documentation analyst. Read the following documentation files "
    "and produce a unified summary capturing all key concepts, requirements, "
    "constraints, and technical details.\n\n"
    "DOCUMENTS:\n{documents}\n\n"
    "Provide a structured summary."
)

MOCK_DOC_SUMMARY = (
    "Documentation describes a web application with REST API endpoints, "
    "database models, and authentication flows. Key requirements include "
    "performance targets and security constraints."
)


def summarize_documentation(doc_texts: list[str]) -> str:
    if is_mock():
        return MOCK_DOC_SUMMARY

    docs_str = "\n\n---\n\n".join(doc_texts)
    model = get_model()
    result = generate_text(
        model=model,
        prompt=SUMMARIZE_DOCS_PROMPT.format(documents=docs_str),
    )
    return result.text


def parse_suggestions(prompts: list[str]) -> list[dict]:
    return [
        {"title": f"Suggestion {i + 1}", "description": p.strip()}
        for i, p in enumerate(prompts)
        if p.strip()
    ]
