import os
import shutil
import subprocess

from app.core.config import settings


def clone_repo(repo_url: str, branch: str = "main", token: str | None = None) -> str:
    target_dir = os.path.join(settings.clone_dir, _repo_slug(repo_url))
    if os.path.exists(target_dir):
        shutil.rmtree(target_dir)
    os.makedirs(settings.clone_dir, exist_ok=True)

    # Parse owner/repo from URL
    parts = repo_url.rstrip("/").replace("https://github.com/", "").replace("http://github.com/", "").split("/")
    if len(parts) < 2:
        raise ValueError(f"Invalid GitHub URL: {repo_url}")
    owner, repo = parts[0], parts[1].replace(".git", "")

    # Download tarball via GitHub API using curl
    effective_token = token or settings.github_token
    tarball_url = f"https://api.github.com/repos/{owner}/{repo}/tarball/{branch}"

    headers = ["-L"]  # Follow redirects
    if effective_token:
        headers.append(f"-H Authorization: token {effective_token}")

    tarball_path = os.path.join(settings.clone_dir, f"{_repo_slug(repo_url)}.tar.gz")

    curl_cmd = ["curl", "-s", "-o", tarball_path] + headers + [tarball_url]

    result = subprocess.run(curl_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"curl download failed: {result.stderr.strip()}")

    # Extract tarball
    subprocess.run(["tar", "-xzf", tarball_path, "-C", settings.clone_dir], check=True)

    # Find and rename extracted directory (GitHub tarball has "owner-repo-hash" format)
    extracted = [d for d in os.listdir(settings.clone_dir) if d.startswith(f"{owner}-{repo}")]
    if not extracted:
        raise RuntimeError(f"Extracted directory not found for {owner}/{repo}")
    extracted_dir = os.path.join(settings.clone_dir, extracted[0])

    # Move contents to target_dir
    shutil.move(extracted_dir, target_dir)
    os.remove(tarball_path)

    return target_dir


def cleanup_repo(path: str) -> None:
    if os.path.exists(path):
        shutil.rmtree(path)


def _repo_slug(repo_url: str) -> str:
    return repo_url.rstrip("/").split("/")[-1].replace(".git", "")
