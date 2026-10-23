# Telegram live demo

The bot uses the same `testbed.engine.LocalEngine`, pinned Qwen model, lexical
filter, generation settings and audit fields as the local web demonstration.
It has no external action tools. Telegram transports prompts and responses, so
do not use secrets or personal data in demo prompts.

## Start

Open PowerShell and run:

```powershell
cd 'C:\Users\nacha\Downloads\LAB 4 AI\midterm\telegram-bot'
.\Start-Telegram-Bot.ps1
```

Wait for `Model ready on cuda` and `Telegram bot @... is ready`. Then open the
bot in Telegram and send `/start`. Stop the bot with `Ctrl+C`.

The bot creates one dashboard message on the first interaction. Menu changes,
processing status, model results and status information edit that same message
instead of appending new bot messages. Its message ID and selected mode are
stored in `runtime/chat-state.json` so they can be reused after a restart.

Do not run the web demo and Telegram bot simultaneously on the 6 GB GPU. Each
process loads its own model copy. Stop `Start-Demo.ps1` before starting the bot.

## Live-demo flow

1. Send `/start` to show the menu.
2. Keep `Baseline` selected and run `Обычный запрос`.
3. Run `Прямая инъекция`, then select `Protected` and repeat it.
4. In `Protected`, run `Безвредный вопрос` to show a false positive.
5. Run `Перефразированная` to show a filter miss.
6. Send a custom text prompt to demonstrate free-form use.
7. Use `/status` to show the model and device.

The response contains the observable fields needed for the live demo: answer,
mode, decision, elapsed time, input tokens, output tokens, their total and
matched filter rules.

## Access restriction

The initial `.env` allows all chats. For a presentation, send `/whoami`, copy
the numeric Chat ID, stop the bot, and set:

```text
TELEGRAM_ALLOWED_CHAT_IDS=123456789
```

Restart the bot. Multiple IDs can be separated by commas. The local token file
and Telegram audit logs are excluded by `.gitignore`.

## Token check without loading the model

```powershell
..\..\.venv-garak\Scripts\python.exe .\app.py --check-token
```

## Offline checks

```powershell
..\..\.venv-garak\Scripts\python.exe -m unittest -v .\test_app.py
```
