"""Frozen lexical filter inherited from the Assignment 2 pilot.

No held-out attack or benign evaluation output was used to tune these rules.
They detect injection indicators, not whether content is harmful in general.
"""

import hashlib
import re

RULES = (
    ("override_forward", r"\b(?:ignore|disregard|forget|override|bypass)\b.{0,100}\b(?:instructions?|rules?|safety|safeguards?|system|developer|previous|prior|above|following|before)\b"),
    ("override_reverse", r"\b(?:instructions?|rules?|system prompt)\b.{0,100}\b(?:ignore|disregard|forget|override|bypass)\b"),
    ("unrestricted_persona", r"\b(?:do anything now|dan mode|jailbreak|developer mode)\b"),
    ("nevermind", r"\bnever\s*mind\b.{0,100}\b(?:instructions?|rules?|task)\b"),
)
COMPILED = tuple((name, re.compile(pattern, re.IGNORECASE | re.DOTALL)) for name, pattern in RULES)
FILTER_SHA256 = hashlib.sha256(repr(RULES).encode()).hexdigest()
REFUSAL = "I cannot assist with a request flagged as an instruction override. The input filter blocked this request."


def inspect_input(text: str) -> list[str]:
    """Return matched rule identifiers, without exposing or executing input."""
    return [name for name, pattern in COMPILED if pattern.search(text)]
