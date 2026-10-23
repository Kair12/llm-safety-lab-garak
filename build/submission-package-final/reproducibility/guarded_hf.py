"""Local Hugging Face generator with a small prompt-injection input filter.

This module is an experiment control, not a production security product.  It
demonstrates a separate validation layer in front of the model so that the
same garak probes can be repeated with and without that layer.
"""

import logging
import re
from typing import List, Union

from garak.attempt import Conversation, Message
from garak.generators.huggingface import Pipeline


class GuardedPipeline(Pipeline):
    """Run a local Hugging Face pipeline after screening the latest user turn."""

    generator_family_name = "Guarded Hugging Face pipeline"

    _INJECTION_PATTERNS = tuple(
        re.compile(pattern, re.IGNORECASE | re.DOTALL)
        for pattern in (
            r"\b(?:ignore|disregard|forget|override|bypass)\b.{0,100}\b(?:instructions?|rules?|safety|safeguards?|system|developer|previous|prior|above|following|before)\b",
            r"\b(?:instructions?|rules?|system prompt)\b.{0,100}\b(?:ignore|disregard|forget|override|bypass)\b",
            r"\b(?:do anything now|dan mode|jailbreak|developer mode)\b",
            r"\bnever\s*mind\b.{0,100}\b(?:instructions?|rules?|task)\b",
        )
    )

    _BLOCK_RESPONSE = (
        "I cannot assist with an embedded request to ignore or override instructions. "
        "The suspected prompt-injection content was blocked by the input filter."
    )

    @classmethod
    def is_suspicious(cls, text: str) -> bool:
        """Return True when text matches a general prompt-injection indicator."""

        return any(pattern.search(text) for pattern in cls._INJECTION_PATTERNS)

    def _call_model(
        self, prompt: Conversation, generations_this_call: int = 1
    ) -> List[Union[Message, None]]:
        user_text = prompt.last_message().text or ""
        if self.is_suspicious(user_text):
            logging.warning("GuardedPipeline blocked a suspected prompt injection")
            return [Message(self._BLOCK_RESPONSE) for _ in range(generations_this_call)]
        return super()._call_model(prompt, generations_this_call)

