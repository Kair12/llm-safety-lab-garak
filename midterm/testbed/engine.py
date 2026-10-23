"""Shared inference path used by the web demonstration and every experiment."""

import copy
import hashlib
import importlib.metadata
import json
import platform
import threading
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

from . import settings
from .safety import FILTER_SHA256, REFUSAL, inspect_input


class LocalEngine:
    def __init__(self, audit_path: Path):
        self.lock = threading.Lock()
        self.audit_path = audit_path
        audit_path.parent.mkdir(parents=True, exist_ok=True)
        print("Loading the pinned local Qwen model...", flush=True)
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer

        self.torch = torch
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        torch.manual_seed(settings.SEED)
        if self.device == "cuda":
            torch.cuda.manual_seed_all(settings.SEED)
            torch.backends.cudnn.benchmark = False
        self.tokenizer = AutoTokenizer.from_pretrained(
            settings.MODEL_ID, revision=settings.MODEL_REVISION, trust_remote_code=False,
        )
        self.model = AutoModelForCausalLM.from_pretrained(
            settings.MODEL_ID, revision=settings.MODEL_REVISION,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
            trust_remote_code=False,
        ).to(self.device).eval()
        self.generation_config = copy.deepcopy(self.model.generation_config)
        self.generation_config.do_sample = False
        self.generation_config.temperature = None
        self.generation_config.top_p = None
        self.generation_config.top_k = None
        self.generation_config.max_new_tokens = settings.MAX_NEW_TOKENS
        self.generation_config.pad_token_id = self.tokenizer.eos_token_id
        self.metadata = {
            "model_id": settings.MODEL_ID, "model_revision": settings.MODEL_REVISION,
            "device": self.device, "gpu": torch.cuda.get_device_name(0) if self.device == "cuda" else None,
            "dtype": str(next(self.model.parameters()).dtype),
            "decoding": "greedy", "seed": settings.SEED,
            "max_new_tokens": settings.MAX_NEW_TOKENS,
            "max_input_tokens": settings.MAX_INPUT_TOKENS,
            "system_prompt": settings.SYSTEM_PROMPT,
            "filter_sha256": FILTER_SHA256,
            "python": platform.python_version(), "platform": platform.platform(),
            "packages": {key: importlib.metadata.version(key) for key in ("torch", "transformers", "garak", "huggingface-hub", "safetensors")},
        }
        print(f"Model ready on {self.device}", flush=True)

    def evaluate(self, prompt: str, mode: str, case_id: str = "interactive") -> dict:
        if mode not in ("baseline", "filtered"):
            raise ValueError("mode must be baseline or filtered")
        if not isinstance(prompt, str) or not prompt.strip() or len(prompt) > 32000:
            raise ValueError("prompt must contain 1 to 32000 characters")
        started = time.perf_counter()
        rules = inspect_input(prompt) if mode == "filtered" else []
        filter_ms = (time.perf_counter() - started) * 1000
        input_tokens = output_tokens = 0
        truncated = False
        with self.lock:
            if rules:
                response = REFUSAL
            else:
                messages = [
                    {"role": "system", "content": settings.SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ]
                formatted = self.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
                inputs = self.tokenizer(formatted, return_tensors="pt").to(self.device)
                input_tokens = int(inputs["input_ids"].shape[-1])
                if input_tokens > settings.MAX_INPUT_TOKENS:
                    raise ValueError("input exceeds the fixed 4096-token budget")
                # Greedy inference makes skipped blocked calls independent of random state.
                with self.torch.inference_mode():
                    tokens = self.model.generate(**inputs, generation_config=self.generation_config)
                generated = tokens[0, input_tokens:]
                output_tokens = len(generated)
                truncated = output_tokens == settings.MAX_NEW_TOKENS and int(generated[-1]) != self.tokenizer.eos_token_id
                response = self.tokenizer.decode(generated, skip_special_tokens=True).strip()
            record = {
                "request_id": str(uuid.uuid4()), "timestamp_utc": datetime.now(timezone.utc).isoformat(),
                "case_id": case_id, "mode": mode, "prompt": prompt,
                "prompt_sha256": hashlib.sha256(prompt.encode()).hexdigest(),
                "response": response, "blocked": bool(rules), "matched_rules": rules,
                "filter_ms": round(filter_ms, 4),
                "latency_ms": round((time.perf_counter() - started) * 1000, 3),
                "input_tokens": input_tokens, "output_tokens": output_tokens,
                "output_truncated": truncated,
                "model_revision": settings.MODEL_REVISION,
            }
            with self.audit_path.open("a", encoding="utf-8") as stream:
                stream.write(json.dumps(record, ensure_ascii=False) + "\n")
        return record
