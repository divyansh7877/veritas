import os
import shutil
import subprocess

from app.core.config import settings


def clone_repo(repo_url: str, branch: str = "main", token: str | None = None) -> str:
    target_dir = os.path.join(settings.clone_dir, _repo_slug(repo_url))
    if os.path.exists(target_dir):
        shutil.rmtree(target_dir)
    os.makedirs(settings.clone_dir, exist_ok=True)

    clone_url = repo_url
    effective_token = token or settings.github_token
    if effective_token and "github.com" in repo_url:
        clone_url = repo_url.replace(
            "https://github.com", f"https://{effective_token}@github.com"
        )

    result = subprocess.run(
        ["git", "clone", "--depth", "1", "--branch", branch, clone_url, target_dir],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"git clone failed: {result.stderr.strip()}")
    return target_dir


def cleanup_repo(path: str) -> None:
    if os.path.exists(path):
        shutil.rmtree(path)


def _repo_slug(repo_url: str) -> str:
    return repo_url.rstrip("/").split("/")[-1].replace(".git", "")
