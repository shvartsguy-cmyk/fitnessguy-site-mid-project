#!/usr/bin/env python3
"""Send test questions to a chat agent's HTTP endpoint and record each answer.

Every question goes out in its own session, so the agent's conversation memory
from one question cannot leak into the next. Handles both an NDJSON stream
(n8n "streaming" webhooks: {"type":"item","content":...} lines) and a plain
JSON or text reply.

Usage:
  python run_tests.py --endpoint URL --questions questions.json --out results.json
                      [--session-field session_id] [--message-field message]
                      [--origin http://localhost:8765] [--label run1] [--timeout 120]

questions.json: a list of strings, or of objects with at least "q"
(other fields such as "expected", "source", "answerable" are copied through).
"""
import argparse
import json
import sys
import time
import urllib.error
import urllib.request

REPLY_KEYS = ("reply", "output", "text", "answer", "response", "message")


def parse_reply(raw):
    """Return (answer_text, error_text) from a streamed or plain response body."""
    answer, errors, saw_stream = [], [], False
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except ValueError:
            continue
        if isinstance(obj, dict) and obj.get("type") in ("begin", "item", "end", "error"):
            saw_stream = True
            if obj["type"] == "item":
                answer.append(str(obj.get("content", "")))
            elif obj["type"] == "error":
                errors.append(str(obj.get("content", "")))
    if saw_stream:
        return "".join(answer).strip(), " | ".join(errors)

    try:
        obj = json.loads(raw)
    except ValueError:
        return raw.strip(), ""
    if isinstance(obj, list) and obj:
        obj = obj[0]
    if isinstance(obj, dict):
        for key in REPLY_KEYS:
            if isinstance(obj.get(key), str):
                return obj[key].strip(), ""
        return json.dumps(obj, ensure_ascii=False), ""
    return str(obj), ""


def ask(endpoint, message, session, args):
    body = json.dumps({args.message_field: message, args.session_field: session},
                      ensure_ascii=False).encode("utf-8")
    headers = {"Content-Type": "application/json; charset=utf-8"}
    if args.origin:
        headers["Origin"] = args.origin
    req = urllib.request.Request(endpoint, data=body, headers=headers, method="POST")
    started = time.time()
    try:
        raw = urllib.request.urlopen(req, timeout=args.timeout).read().decode("utf-8", "replace")
        answer, error = parse_reply(raw)
    except urllib.error.HTTPError as e:
        answer, error = "", f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:300]}"
    except Exception as e:  # timeouts, DNS, connection resets
        answer, error = "", f"{type(e).__name__}: {e}"
    return answer, error, round(time.time() - started, 1)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--endpoint", required=True)
    p.add_argument("--questions", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--session-field", default="session_id")
    p.add_argument("--message-field", default="message")
    p.add_argument("--origin", default="")
    p.add_argument("--label", default=time.strftime("%Y%m%d-%H%M"))
    p.add_argument("--timeout", type=int, default=120)
    args = p.parse_args()

    with open(args.questions, encoding="utf-8") as f:
        items = [q if isinstance(q, dict) else {"q": q} for q in json.load(f)]

    results = []
    for n, item in enumerate(items, 1):
        answer, error, sec = ask(args.endpoint, item["q"], f"test-{args.label}-{n}", args)
        results.append({**item, "n": n, "answer": answer, "error": error, "sec": sec})
        status = "ERROR " + error[:80] if error or not answer else f"{len(answer)} chars"
        print(f"#{n} {sec}s {status}", flush=True)

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=1)

    answered = [r for r in results if r["answer"] and not r["error"]]
    if answered:
        print(f"avg {round(sum(r['sec'] for r in answered) / len(answered), 1)}s over {len(answered)} answers")
    failed = len(results) - len(answered)
    if failed:
        # An empty answer in ~2s usually means the model provider failed, not the bot logic.
        print(f"{failed} question(s) got no answer; see 'error' in {args.out}", file=sys.stderr)


if __name__ == "__main__":
    main()
