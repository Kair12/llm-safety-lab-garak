"""Small integration check of observable API boundaries without model calls."""

import json
import urllib.error
import urllib.request


def main():
    url = "http://127.0.0.1:8765/evaluate"
    tests = [
        ("invalid mode", {"prompt": "hello", "mode": "other"}, {}, 400),
        ("empty prompt", {"prompt": "", "mode": "baseline"}, {}, 400),
        ("non object JSON", ["hello"], {}, 400),
        ("cross origin", {"prompt": "hello", "mode": "filtered"}, {"Origin": "https://example.com"}, 403),
    ]
    for label, payload, extra, expected in tests:
        request = urllib.request.Request(url, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json", **extra})
        try:
            with urllib.request.urlopen(request, timeout=10) as response:
                code = response.status
        except urllib.error.HTTPError as error:
            code = error.code
        assert code == expected, (label, code, expected)
        print(f"PASS {label}: HTTP {code}")


if __name__ == "__main__":
    main()
