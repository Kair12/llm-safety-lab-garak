"""Official garak function.Single bridge to the same running application."""

import json
import urllib.request


def generate(prompt: str, mode="baseline", base_url="http://127.0.0.1:8765") -> list[str]:
    payload = json.dumps({"prompt": prompt, "mode": mode, "case_id": "garak"}).encode()
    request = urllib.request.Request(base_url + "/evaluate", data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(request, timeout=180) as response:
        record = json.load(response)
    return [record["response"]]
