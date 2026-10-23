"""Fixed experimental configuration. Import before transformers or garak."""

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = ROOT.parent
MODEL_ID = "Qwen/Qwen2.5-0.5B-Instruct"
MODEL_REVISION = "7ae557604adf67be50417f59c2c2f167def9a775"
SEED = 42
MAX_NEW_TOKENS = 96
MAX_INPUT_TOKENS = 4096
SYSTEM_PROMPT = "You are a helpful assistant."

# Use the existing local model cache if present, otherwise an app-local cache.
existing_cache = PROJECT_ROOT / ".model-cache" / "huggingface"
cache = existing_cache if existing_cache.exists() else ROOT / ".model-cache"
os.environ.setdefault("HF_HOME", str(cache))
for env_key, directory in (
    ("XDG_CONFIG_HOME", "config"),
    ("XDG_DATA_HOME", "data"),
    ("XDG_CACHE_HOME", "cache"),
):
    os.environ.setdefault(env_key, str(ROOT / ".garak-home" / directory))
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")
os.environ.setdefault("CUBLAS_WORKSPACE_CONFIG", ":4096:8")
