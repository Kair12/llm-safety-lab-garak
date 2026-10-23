import importlib.util
import unittest
from pathlib import Path


SPEC = importlib.util.spec_from_file_location("telegram_demo_app", Path(__file__).with_name("app.py"))
app = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(app)


class FakeAPI:
    def __init__(self):
        self.messages = []
        self.edits = []
        self.callbacks = []
        self.typing = []
        self.next_message_id = 100

    def send_message(self, chat_id, text, reply_markup=None):
        self.messages.append((chat_id, text, reply_markup))
        result = {"message_id": self.next_message_id}
        self.next_message_id += 1
        return result

    def edit_message(self, chat_id, message_id, text, reply_markup=None):
        self.edits.append((chat_id, message_id, text, reply_markup))
        return {"message_id": message_id}

    def send_typing(self, chat_id):
        self.typing.append(chat_id)

    def answer_callback(self, callback_id, text=""):
        self.callbacks.append((callback_id, text))


class FakeEngine:
    metadata = {
        "model_id": "Qwen/test",
        "gpu": "Test GPU",
        "decoding": "greedy",
        "max_new_tokens": 96,
    }

    def __init__(self):
        self.calls = []

    def evaluate(self, prompt, mode, case_id):
        self.calls.append((prompt, mode, case_id))
        return {
            "response": "<safe>",
            "blocked": mode == "filtered",
            "matched_rules": ["test_rule"] if mode == "filtered" else [],
            "latency_ms": 125.0,
            "input_tokens": 5,
            "output_tokens": 2,
            "output_truncated": False,
        }


class BotTests(unittest.TestCase):
    def setUp(self):
        self.api = FakeAPI()
        self.engine = FakeEngine()
        self.bot = app.BotController(self.api, self.engine, rate_limit_seconds=0)

    def test_start_shows_baseline_menu(self):
        self.bot.handle_message({"chat": {"id": 7}, "text": "/start"})
        self.assertIn("Baseline", self.api.messages[-1][1])
        self.assertNotIn("ту же локальную модель", self.api.messages[-1][1])
        self.assertIsNotNone(self.api.messages[-1][2])

    def test_followup_command_edits_the_existing_dashboard(self):
        self.bot.handle_message({"chat": {"id": 7}, "text": "/start"})
        self.bot.handle_message({"chat": {"id": 7}, "text": "/protected"})
        self.assertEqual(1, len(self.api.messages))
        self.assertEqual(100, self.api.edits[-1][1])
        self.assertIn("Protected", self.api.edits[-1][2])

    def test_mode_callback_changes_mode(self):
        self.bot.handle_callback({"id": "c1", "data": "mode:filtered", "message": {"chat": {"id": 7}, "message_id": 51}})
        self.assertEqual("filtered", self.bot.mode(7))
        self.assertEqual(("c1", "Режим изменён"), self.api.callbacks[-1])
        self.assertEqual(51, self.api.edits[-1][1])

    def test_custom_prompt_uses_selected_mode_and_escapes_output(self):
        self.bot.chat_modes[7] = "filtered"
        self.bot.handle_message({"chat": {"id": 7}, "text": "hello"})
        self.assertEqual(("hello", "filtered", "telegram-custom"), self.engine.calls[-1])
        self.assertEqual(1, len(self.api.messages))
        self.assertIn("&lt;safe&gt;", self.api.edits[-1][2])
        self.assertIn("Blocked", self.api.edits[-1][2])
        self.assertIn("Всего токенов:</b> 7", self.api.edits[-1][2])

    def test_example_button_runs_fixed_prompt(self):
        self.bot.handle_callback({"id": "c2", "data": "example:direct", "message": {"chat": {"id": 9}, "message_id": 52}})
        self.assertEqual(app.EXAMPLES["direct"], self.engine.calls[-1][0])
        self.assertEqual("telegram-direct", self.engine.calls[-1][2])
        self.assertEqual(0, len(self.api.messages))
        self.assertGreaterEqual(len(self.api.edits), 2)

    def test_allowed_chat_ids_restrict_access(self):
        restricted = app.BotController(self.api, self.engine, allowed_chat_ids={10}, rate_limit_seconds=0)
        restricted.handle_message({"chat": {"id": 11}, "text": "hello"})
        self.assertEqual([], self.engine.calls)
        self.assertIn("Доступ ограничен", self.api.messages[-1][1])


if __name__ == "__main__":
    unittest.main()
