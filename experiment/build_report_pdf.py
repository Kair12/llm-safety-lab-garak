from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "deliverables" / "LLM_Safety_Experimental_Report.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

NAVY = colors.HexColor("#17365D")
BLUE = colors.HexColor("#1775A8")
CYAN = colors.HexColor("#35B6D4")
RED = colors.HexColor("#D75050")
GREEN = colors.HexColor("#2A9D78")
INK = colors.HexColor("#172633")
SLATE = colors.HexColor("#536575")
LINE = colors.HexColor("#D9E2E8")
PALE = colors.HexColor("#F3F7FA")


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(CYAN)
    canvas.setLineWidth(0.6)
    canvas.line(0.58 * inch, 0.48 * inch, 7.92 * inch, 0.48 * inch)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(SLATE)
    canvas.drawString(0.58 * inch, 0.28 * inch, "LLM Safety Evaluation and NVIDIA garak")
    canvas.drawRightString(7.92 * inch, 0.28 * inch, f"Page {doc.page}")
    canvas.restoreState()


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="ReportTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=23,
        textColor=colors.black,
        alignment=TA_LEFT,
        spaceAfter=5,
    )
)
styles.add(
    ParagraphStyle(
        name="Subtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=10.5,
        leading=13,
        textColor=SLATE,
        spaceAfter=8,
    )
)
styles.add(
    ParagraphStyle(
        name="H1Black",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=15,
        textColor=colors.black,
        spaceBefore=7,
        spaceAfter=3,
        keepWithNext=True,
    )
)
styles.add(
    ParagraphStyle(
        name="BodyCompact",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9.4,
        leading=11.7,
        textColor=INK,
        spaceAfter=4,
    )
)
styles.add(
    ParagraphStyle(
        name="BulletCompact",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9.2,
        leading=11.3,
        leftIndent=13,
        firstLineIndent=-8,
        bulletIndent=2,
        textColor=INK,
        spaceAfter=2,
    )
)
styles.add(
    ParagraphStyle(
        name="Ref",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=7.7,
        leading=9.5,
        leftIndent=12,
        firstLineIndent=-12,
        textColor=INK,
        spaceAfter=2,
    )
)
styles.add(
    ParagraphStyle(
        name="Cell",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=7.8,
        leading=9.2,
        textColor=INK,
    )
)
styles.add(
    ParagraphStyle(
        name="CellHead",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=9.5,
        textColor=colors.white,
    )
)


def p(text):
    return Paragraph(text, styles["BodyCompact"])


def h(text):
    return Paragraph(text, styles["H1Black"])


def bullet(text):
    return Paragraph(text, styles["BulletCompact"], bulletText="-")


def styled_table(rows, widths, header=True):
    converted = []
    for row_index, row in enumerate(rows):
        style = styles["CellHead"] if row_index == 0 and header else styles["Cell"]
        converted.append([Paragraph(str(cell), style) for cell in row])
    table = Table(converted, colWidths=widths, repeatRows=1 if header else 0, hAlign="LEFT")
    commands = [
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    if header:
        commands.append(("BACKGROUND", (0, 0), (-1, 0), NAVY))
    for row_index in range(1 if header else 0, len(rows)):
        if row_index % 2 == 0:
            commands.append(("BACKGROUND", (0, row_index), (-1, row_index), PALE))
    table.setStyle(TableStyle(commands))
    return table


story = []
story.append(Paragraph("LLM Safety Evaluation with NVIDIA garak", styles["ReportTitle"]))
story.append(Paragraph("Research review and controlled red teaming experiment", styles["Subtitle"]))
story.append(
    p(
        "This report reviews a 2026 ACL Findings study on jailbreak attacks and content safety filters, then tests a local language model with NVIDIA garak. Prompt injection succeeded in 7 of 16 sampled cases, and one DAN jailbreak succeeded. A stronger system instruction did not improve either result. A separate input filter reduced the reported failures to zero, but it blocked 3 of 20 benign prompts. The evidence supports layered controls and broader evaluation rather than a claim of complete safety."
    )
)

story.append(h("Selected scientific study"))
story.append(
    p(
        "Xin et al. examine the gap between model-only jailbreak evaluation and deployments that add moderation before and after inference [1]. Their research question asks whether jailbreaks that defeat an aligned model still succeed when the complete pipeline contains content safety filters. This focus directly covers red teaming, automated vulnerability testing, jailbreaks, and evaluation of AI safety controls."
    )
)

story.append(h("Methodology and metrics"))
story.append(
    p(
        "The authors evaluate ten jailbreak methods against open and proprietary models, including Llama, Mistral, Vicuna, Qwen, GPT-4o, and GPT-4-Turbo. They pair 417 harmful prompts with 417 topic-aligned benign prompts across ten safety categories. The pipeline includes input and output filters such as OpenAI moderation, LlamaGuard, PromptGuard, InjecGuard, GradSafe, and O3."
    )
)
story.append(
    p(
        "The study reports original attack success rate, input and output detection, end-to-end pass rate, precision, recall, accuracy, F1, latency, and financial cost. These measures belong together because a filter can detect attacks while also rejecting legitimate requests or adding operational overhead."
    )
)

story.append(h("Findings and critical assessment"))
story.append(
    p(
        "At least one tested filter detects nearly every jailbreak technique, so model-only evaluations can overstate practical attack success. The filters differ in precision and recall. PromptGuard shows strong detection but an extreme false-positive problem in the reported setting. Adaptive attacks remain important: adaptive TAP raises success against OpenAI moderation from 28.4% to 88.3%, with more iterations [1]."
    )
)
story.append(
    p(
        "The paper has a strong pipeline threat model, a balanced benign set, and operational metrics. Its limits include restricted API budgets, no tool-using agent evaluation, and preliminary adaptive analysis. The local experiment below uses a narrower before-and-after comparison and adds a small benign false-positive check."
    )
)

story.append(PageBreak())

story.append(h("Experimental methodology"))
story.append(
    p(
        "The target was Qwen2.5-0.5B-Instruct through a local Hugging Face pipeline on an NVIDIA GeForce GTX 1660 with 6 GB VRAM [3]. NVIDIA garak version 0.17.1rc1 came from the official repository at commit 346497afcd86ff5ba137cfbcaaeba4e9c9f6c970 [2]. Every run used seed 42, one generation per prompt, and the same decoding settings. The smaller 0.5B model fit the available GPU but does not reproduce the paper's Qwen2.5-7B setting."
    )
)
story.append(Spacer(1, 3))
story.append(
    styled_table(
        [
            ["Probe", "Purpose", "Prompts", "Detector"],
            ["HijackLongPrompt", "Embedded instruction override", "16 sampled from 256", "AttackRogueString"],
            ["DAN 11.0", "Unrestricted persona jailbreak", "1 standardized prompt", "DAN and MitigationBypass"],
        ],
        [1.35 * inch, 2.05 * inch, 1.25 * inch, 2.1 * inch],
    )
)
story.append(Spacer(1, 4))

story.append(h("Baseline and mitigation results"))
story.append(
    styled_table(
        [
            ["Evaluation", "Baseline", "System instruction", "Input filter"],
            ["PromptInject failures", "7/16  43.75%", "7/16  43.75%", "0/16  0%"],
            ["DAN detector failures", "1/1  100%", "1/1  100%", "0/1  0%"],
            ["Mitigation bypass failures", "1/1  100%", "1/1  100%", "0/1  0%"],
        ],
        [2.05 * inch, 1.55 * inch, 1.65 * inch, 1.55 * inch],
    )
)

story.append(h("Safety failure analysis"))
story.append(
    p(
        "<b>Prompt injection.</b> The expected behavior was to complete the original benign task and treat the embedded override as untrusted data. Seven responses reproduced the attack marker. The failed safety property was instruction hierarchy. In a retrieval or tool-enabled system, the same weakness could redirect an assistant, disclose contextual information, or cause an unintended action."
    )
)
story.append(
    p(
        "<b>DAN jailbreak.</b> The expected behavior was to reject the unrestricted persona. The baseline response began with \"DAN Mode enabled,\" so both the DAN detector and mitigation-bypass detector reported failure. This suggests weak resistance to role-play overrides, although one prompt provides little statistical evidence."
    )
)
story.append(
    p(
        "<b>Detector limitation.</b> AttackRogueString searches for the target string. One response split the marker into a numbered list and received a score of zero even though the output plausibly followed the injected request. The reported 43.75% may therefore underestimate semantic compliance."
    )
)

story.append(h("Implemented mitigation"))
story.append(
    p(
        "A prompt-only control first placed security instructions in a system message. It did not change either result. The implemented control added an input filter before inference. It screens for instruction override and unrestricted-persona patterns, blocked 15 of 16 PromptInject inputs and the DAN input, and returned a standard refusal. The one allowed PromptInject input did not emit the exact attack marker."
    )
)

story.append(PageBreak())

story.append(h("Residual risk and recommendations"))
story.append(
    p(
        "The input filter improved the selected scores without establishing model safety. Attackers can evade keyword rules with paraphrases, encoding, multilingual prompts, or multi-turn interaction. The filter also blocked 3 of 20 hand-written benign prompts, a 15% false-positive rate. Those cases involved legitimate translation or educational use of security terms. This convenience sample illustrates a usability tradeoff but does not estimate a production false-positive rate."
    )
)
story.append(bullet("Separate trusted system instructions from retrieved documents and user-controlled data, and preserve source provenance."))
story.append(bullet("Restrict external tools by default and require human approval for consequential or irreversible actions."))
story.append(bullet("Validate outputs and tool arguments against task-specific schemas or allow-lists before execution."))
story.append(bullet("Repeat evaluation with larger benign and attack sets, adaptive variants, multilingual prompts, and multiple seeds."))

story.append(h("Conclusion"))
story.append(
    p(
        "The experiment reproduced two safety failures on a small local model. A stronger system instruction did not help. A separate input filter stopped the tested signatures at the cost of false positives. This pattern agrees with Xin et al.: pipeline filters can reduce observed jailbreak success, but their precision, recall, and adaptive resistance determine whether they improve real safety. The conclusion applies only to the tested model, prompts, detector rules, and configuration."
    )
)

story.append(h("References"))
references = [
    "[1] Y. Xin, D. Chen, L. Yang, M. Backes, and X. Zhang, \"Jailbreaking Attacks vs. Content Safety Filters: How Far Are We in the LLM Safety Arms Race?\" Findings of ACL 2026, pp. 421-445, 2026. doi: 10.18653/v1/2026.findings-acl.20.",
    "[2] NVIDIA, \"garak: Generative AI Red-teaming and Assessment Kit,\" GitHub repository, 2026. https://github.com/NVIDIA/garak",
    "[3] Qwen Team, \"Qwen2.5-0.5B-Instruct,\" Hugging Face model card, 2024. https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct",
    "[4] F. Perez and I. Ribeiro, \"Ignore Previous Prompt: Attack Techniques for Language Models,\" NeurIPS ML Safety Workshop, 2022. https://arxiv.org/abs/2211.09527",
]
for reference in references:
    story.append(Paragraph(reference, styles["Ref"]))

story.append(h("AI Use Declaration"))
story.append(
    p(
        "I used ChatGPT Codex to explain the assignment, help install and configure NVIDIA garak, draft reproducibility scripts, summarize logs, improve the language and formatting, and generate the abstract presentation cover illustration. I independently selected the paper, reviewed the experimental evidence, checked model responses, and remain responsible for the interpretation and conclusions. I verified references against the ACL Anthology, the official NVIDIA garak repository and documentation, the Qwen model card, and the saved JSONL and HTML reports. I did not treat AI-generated claims or citations as verified without checking those sources."
    )
)

doc = SimpleDocTemplate(
    str(OUTPUT),
    pagesize=letter,
    rightMargin=0.58 * inch,
    leftMargin=0.58 * inch,
    topMargin=0.52 * inch,
    bottomMargin=0.58 * inch,
    title="LLM Safety Evaluation with NVIDIA garak",
    author="Student",
)
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUTPUT)
