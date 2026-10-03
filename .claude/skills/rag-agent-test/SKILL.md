---
name: rag-agent-test
description: Test a RAG chatbot / AI agent against its own knowledge base. Writes a test set (mostly questions the docs answer, plus a couple they don't, to check the agent admits "I don't know" instead of inventing), sends each one to the live agent endpoint in a fresh session, grades every answer against the source text, and writes a results table. Use whenever the user wants to check, test, evaluate or QA a bot/agent/RAG pipeline, asks "does the bot answer correctly", wants the course's "10 test questions (8 answerable, 2 not)", wants to compare two models or prompt versions on the same questions, or says things like "תבדוק את הבוט", "תריץ שאלות בדיקה", "שאלות בדיקה לסוכן", "האם הסוכן עונה נכון" — even if they don't say "test".
---

# RAG agent test

The goal is evidence: did the agent answer correctly from the knowledge base, and did it refuse to invent things that aren't there? A test that only asks easy questions, or that grades from memory instead of the source, proves nothing. Everything below exists to keep the test honest.

## 1. Find the target

You need two things: the knowledge base and the agent's endpoint.

- **Knowledge base:** look for a folder of docs that were loaded into the vector store (e.g. `knowledge/`, `docs/`, `kb/`). The project's `CLAUDE.md` usually says where it is and which index it feeds.
- **Endpoint:** the HTTP webhook the site/chat widget calls. Check `CLAUDE.md`, then the front-end code (search for `fetch(` / `ENDPOINTS`) to learn the URL, the request body field names (often `message` and `session_id`) and whether the reply is streamed.
- **Origin and model:** if the project documents an allowed origin for the webhook (CORS), send it with `--origin`. Note the model the agent runs on, from `CLAUDE.md` or the workflow, so the results say what was tested.
- If either is missing, ask the user. Don't guess a URL.
- **Existing test set?** If the project already has test questions (e.g. `spec/test-questions.md`), reuse that set when the user is checking a fix or a model change, so the runs compare. Write a new set when they want a fresh check, or the old set was already used to tune the prompt.

## 2. Write the questions

Default: **10 questions — 8 answerable, 2 unanswerable** (the AI DEV course requirement). Use another split if the user asks.

**Answerable questions**
- Spread them over as many different knowledge files as you can; eight questions from one file tests one file.
- Phrase them the way a customer would ask ("I'm flying abroad for two weeks, can I freeze?"), not by copying the doc's own question. Copied wording makes retrieval trivially easy and hides real weaknesses.
- Prefer questions with a checkable fact: a price, a number of days, a dose, an angle, an age limit. Those grade cleanly.
- For each one, record the expected answer and the exact source file, quoted from the doc — not from what you think is true.

**Unanswerable questions**
- Pick topics a customer could plausibly ask that the docs don't cover (a discount type that doesn't exist, a product the business doesn't sell).
- **Verify they really are absent:** grep the knowledge base for the key terms in the language of the docs, and read the matching lines rather than counting files. Substring matches mislead, especially in Hebrew: "קופת" also matches inside "תקופת". If anything genuinely related turns up, pick another topic. An "unanswerable" question that the docs partly answer makes the test unfair.
- Expected behaviour: the agent says it doesn't have that information and doesn't invent one. Pointing to a human or a form is fine; mentioning related facts that *are* in the docs is fine.

Save the questions as JSON (`[{"q": ..., "expected": ..., "source": ..., "answerable": true}, ...]`) in a scratch location, not in the project. Put the results JSON next to it.

## 3. Run them

```bash
python <skill-dir>/scripts/run_tests.py --endpoint <URL> --questions <questions.json> --out <results.json> \
  [--session-field session_id] [--message-field message] [--origin <site origin if the webhook checks CORS>]
```

- Each question gets its own session ID, so the agent's memory can't carry context from one question to the next.
- Handles n8n NDJSON streams and plain JSON replies.
- On Windows, set `PYTHONIOENCODING=utf-8` before printing Hebrew or other non-Latin text to the console.
- **If several answers come back empty within ~2 seconds,** look at the `error` field before concluding anything. That pattern is almost always the model provider (credits, rate limit, outage), not the bot. Wait a minute and rerun; don't record it as failures of the agent.

## 4. Grade

Grade each answer against the **source text**, not against general knowledge:
- **Pass:** the key facts match the doc. Extra phrasing or a call to action is fine.
- **Fail:** a wrong number, a missing key fact, or anything invented that the doc doesn't say.
- **Unanswerable:** passes only if the agent says it doesn't know, or doesn't have the info, and invents nothing.
- Note smaller issues separately without failing the answer: an extra claim not in the docs, a pointer to a form or channel that doesn't exist, an answer far longer than the bot's style rules allow. These are what usually needs fixing in the prompt.

Show the user a short summary: the score, which ones failed and why, the average time, and the minor issues.

## 5. Document

Write or append to `spec/test-questions.md` (or wherever the project keeps its test results). Use the project's language — if the docs and the bot are in Hebrew, write the file in Hebrew. Include:
- Date, endpoint/channel, model if known, and the fact that each question ran in a separate session.
- A table: `# | question | expected answer (source file) | agent's answer, short | time | ✅/❌`.
- The score against the required threshold (e.g. 8/10).
- Notes: minor issues, provider errors and reruns.

Never overwrite earlier runs; they are the evidence. **Append** a new dated section:
- **Same question set rerun after a fix or a model change:** add a comparison table (old time vs new time, still passing?).
- **New question set:** a full table, as above, under its own heading.

## Pitfalls seen in practice

- Asking every question in one session: later answers lean on earlier ones, and the score is inflated.
- Unanswerable questions that are actually half-covered in the docs.
- Treating a provider outage as a bot failure.
- Testing only the channel that's easy to reach. If the agent has other channels with extra tools (e.g. Telegram with weigh-in or escalation tools), tell the user those tools still need a manual check — this skill tests what the HTTP endpoint exposes.
