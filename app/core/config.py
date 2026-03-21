from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str
    gemini_api_key: str
    use_mock_llm: bool = True
    github_token: str = ""
    clone_dir: str = "/tmp/veritas_repos"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
