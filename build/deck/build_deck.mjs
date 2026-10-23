import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  FileBlob,
  Presentation,
  PresentationFile,
} from "@oai/artifact-tool";

const workspaceDir = "C:\\Users\\nacha\\Downloads\\LAB 4 AI";
const SKILL_DIR = "C:\\Users\\nacha\\.codex\\plugins\\cache\\openai-primary-runtime\\presentations\\26.1013.11914\\skills\\presentations";
const RUNTIME_PYTHON = "C:\\Users\\nacha\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe";
const buildDir = path.join(workspaceDir, "build", "deck");
const finalDir = path.join(workspaceDir, "deliverables");
const FINAL_PPTX = path.join(finalDir, "LLM_Safety_Evaluation_Garak_Submission.pptx");
const coverPath = path.join(workspaceDir, "assets", "llm-security-cover.png");

const {
  applyPresentationChartFont,
  finalizePresentation,
  makeNativeBulletParagraphs,
} = await import(
  pathToFileURL(path.join(SKILL_DIR, "container_tools", "artifact_tool_utils.mjs")).href
);

const FONT = "Arial";
const C = {
  navy: "#081B2C",
  navy2: "#12324A",
  blue: "#1775A8",
  cyan: "#35B6D4",
  red: "#D75050",
  green: "#2A9D78",
  ink: "#10202E",
  slate: "#536575",
  pale: "#F3F7FA",
  line: "#D7E1E8",
  white: "#FFFFFF",
};

await fs.mkdir(buildDir, { recursive: true });
await fs.mkdir(finalDir, { recursive: true });

const presentation = Presentation.create({ slideSize: { width: 1280, height: 720 } });

function addText(slide, text, position, style = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    typeface: FONT,
    fontSize: 24,
    color: C.ink,
    autoFit: "none",
    ...style,
  };
  return shape;
}

function addTitle(slide, title, number) {
  slide.background.fill = C.white;
  addText(slide, title, { left: 70, top: 44, width: 1030, height: 56 }, {
    fontSize: 44,
    bold: true,
    color: C.navy,
  });
  slide.shapes.add({
    geometry: "rect",
    position: { left: 70, top: 108, width: 1140, height: 3 },
    fill: C.cyan,
    line: { style: "solid", fill: "none", width: 0 },
  });
  addText(slide, String(number).padStart(2, "0"), { left: 1150, top: 47, width: 60, height: 28 }, {
    fontSize: 18,
    bold: true,
    color: C.slate,
    textAlign: "right",
  });
}

function addFooter(slide, text = "Controlled local evaluation  |  seed 42") {
  addText(slide, text, { left: 70, top: 679, width: 900, height: 22 }, {
    fontSize: 14,
    color: C.slate,
  });
}

function addBullets(slide, items, position, style = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = makeNativeBulletParagraphs(items, {
    marginLeftPoints: 18,
    hangingPoints: 9,
    spaceAfterPoints: 10,
  });
  shape.text.style = {
    typeface: FONT,
    fontSize: 24,
    color: C.ink,
    autoFit: "none",
    ...style,
  };
  return shape;
}

function addMetric(slide, value, label, left, top, color = C.blue) {
  addText(slide, value, { left, top, width: 210, height: 70 }, {
    fontSize: 54,
    bold: true,
    color,
    textAlign: "center",
  });
  addText(slide, label, { left, top: top + 70, width: 210, height: 60 }, {
    fontSize: 19,
    color: C.slate,
    textAlign: "center",
  });
}

function addProcessBox(slide, text, left, top, width, fill, color = C.white) {
  const box = slide.shapes.add({
    geometry: "roundRect",
    position: { left, top, width, height: 94 },
    fill,
    line: { style: "solid", fill, width: 1 },
    borderRadius: "rounded-lg",
  });
  box.text = text;
  box.text.style = {
    typeface: FONT,
    fontSize: 21,
    bold: true,
    color,
    textAlign: "center",
    verticalAlignment: "middle",
    autoFit: "none",
  };
  return box;
}

function addArrow(slide, left, top, width = 70) {
  slide.shapes.add({
    geometry: "rightArrow",
    position: { left, top, width, height: 34 },
    fill: C.cyan,
    line: { style: "solid", fill: C.cyan, width: 1 },
  });
}

function setNotes(slide, lines) {
  slide.speakerNotes.text = lines;
  slide.speakerNotes.setVisible(true);
}

async function readImageBlob(imagePath) {
  const bytes = await fs.readFile(imagePath);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

// Slide 1
{
  const slide = presentation.slides.add();
  slide.background.fill = C.navy;
  slide.images.add({
    blob: await readImageBlob(coverPath),
    contentType: "image/png",
    alt: "Abstract illustration of adversarial signals meeting a shield around a neural network",
    fit: "cover",
    position: { left: 0, top: 0, width: 1280, height: 720 },
  });
  slide.shapes.add({
    geometry: "rect",
    position: { left: 0, top: 0, width: 670, height: 720 },
    fill: C.navy,
    line: { style: "solid", fill: "none", width: 0 },
  });
  addText(slide, "LLM Safety Evaluation", { left: 72, top: 145, width: 540, height: 150 }, {
    fontSize: 56,
    bold: true,
    color: C.white,
  });
  addText(slide, "Research review and controlled red teaming with NVIDIA garak", { left: 76, top: 325, width: 500, height: 110 }, {
    fontSize: 27,
    color: "#C8E8F3",
  });
  addText(slide, "Selected paper  Xin et al.  ACL Findings 2026", { left: 76, top: 565, width: 520, height: 40 }, {
    fontSize: 18,
    color: "#9FC8D8",
  });
  setNotes(slide, [
    "This presentation reports a controlled local experiment and does not claim complete model safety.",
    "Source: https://aclanthology.org/2026.findings-acl.20/",
  ]);
}

// Slide 2
{
  const slide = presentation.slides.add();
  addTitle(slide, "Research problem and motivation", 2);
  addText(slide, "Model-only testing misses deployment controls", { left: 70, top: 145, width: 620, height: 82 }, {
    fontSize: 31,
    bold: true,
    color: C.blue,
  });
  addText(slide,
    "A jailbreak can defeat model alignment and still fail at the input or output filter. The selected paper measures the complete inference pipeline, where detection quality and false positives both affect safety.",
    { left: 70, top: 245, width: 565, height: 175 },
    { fontSize: 25, color: C.ink }
  );
  addMetric(slide, "834", "paired harmful and benign prompts", 720, 164, C.blue);
  addMetric(slide, "10", "safety categories", 960, 164, C.cyan);
  slide.shapes.add({ geometry: "rect", position: { left: 700, top: 335, width: 450, height: 2 }, fill: C.line, line: { style: "solid", fill: "none", width: 0 } });
  addText(slide, "Research question", { left: 720, top: 370, width: 260, height: 38 }, { fontSize: 20, bold: true, color: C.slate });
  addText(slide, "How much attack success remains after content safety filters screen the request and response?", { left: 720, top: 420, width: 450, height: 125 }, { fontSize: 27, bold: true, color: C.navy });
  addFooter(slide);
  setNotes(slide, [
    "Xin et al. pair 417 harmful prompts with 417 topic-aligned benign prompts across ten categories.",
    "Source: https://aclanthology.org/2026.findings-acl.20/",
  ]);
}

// Slide 3
{
  const slide = presentation.slides.add();
  addTitle(slide, "Selected scientific paper", 3);
  addText(slide, "Jailbreaking Attacks vs. Content Safety Filters", { left: 70, top: 145, width: 770, height: 60 }, { fontSize: 34, bold: true, color: C.navy });
  addText(slide, "Xin, Chen, Yang, Backes, and Zhang  |  Findings of ACL 2026", { left: 70, top: 210, width: 820, height: 38 }, { fontSize: 21, color: C.slate });
  addBullets(slide, [
    "Ten jailbreak methods tested against open and proprietary LLMs",
    "Input and output filters evaluated as part of the inference pipeline",
    "Metrics include attack success, detection, precision, recall, latency, and cost",
    "Adaptive TAP increased success against OpenAI moderation from 28.4% to 88.3%",
  ], { left: 70, top: 285, width: 700, height: 285 }, { fontSize: 23 });
  addText(slide, "Core finding", { left: 850, top: 280, width: 290, height: 40 }, { fontSize: 20, bold: true, color: C.red, textAlign: "center" });
  addText(slide, "Filters catch many attacks, but precision and adaptive resistance remain unresolved", { left: 830, top: 335, width: 335, height: 190 }, { fontSize: 29, bold: true, color: C.navy, textAlign: "center" });
  addFooter(slide, "Peer reviewed  |  ACL Anthology ID 2026.findings-acl.20");
  setNotes(slide, [
    "Paper metadata and abstract: https://aclanthology.org/2026.findings-acl.20/",
    "The adaptive TAP values are reported in the paper PDF.",
  ]);
}

// Slide 4
{
  const slide = presentation.slides.add();
  addTitle(slide, "Threat model and related work", 4);
  addProcessBox(slide, "Attacker controlled\ninput", 70, 220, 210, C.red);
  addArrow(slide, 300, 250);
  addProcessBox(slide, "Input\nfilter", 390, 220, 190, C.blue);
  addArrow(slide, 600, 250);
  addProcessBox(slide, "Aligned\nLLM", 690, 220, 190, C.navy2);
  addArrow(slide, 900, 250);
  addProcessBox(slide, "Output\nfilter", 990, 220, 190, C.green);
  addText(slide, "Attack surfaces", { left: 70, top: 390, width: 220, height: 36 }, { fontSize: 20, bold: true, color: C.slate });
  addBullets(slide, [
    "Direct prompt injection and role-play jailbreaks",
    "Obfuscated, multilingual, adaptive, and multi-turn variants",
    "False positives that reject legitimate security-related requests",
  ], { left: 70, top: 440, width: 580, height: 170 }, { fontSize: 22 });
  addText(slide, "Security property", { left: 770, top: 390, width: 240, height: 36 }, { fontSize: 20, bold: true, color: C.slate });
  addText(slide, "Trusted instructions must retain priority over attacker-controlled text across the full pipeline.", { left: 770, top: 440, width: 390, height: 150 }, { fontSize: 27, bold: true, color: C.navy });
  addFooter(slide);
  setNotes(slide, [
    "PromptInject related work: https://arxiv.org/abs/2211.09527",
    "Pipeline framing: https://aclanthology.org/2026.findings-acl.20/",
  ]);
}

// Slide 5
{
  const slide = presentation.slides.add();
  addTitle(slide, "Experimental methodology", 5);
  addProcessBox(slide, "1  Baseline", 100, 190, 270, C.navy);
  addArrow(slide, 395, 220, 85);
  addProcessBox(slide, "2  Mitigation", 505, 190, 270, C.blue);
  addArrow(slide, 800, 220, 85);
  addProcessBox(slide, "3  Repeat", 910, 190, 270, C.green);
  addText(slide, "PromptInject\n16 sampled prompts\n\nDAN 11.0\n1 standardized prompt", { left: 100, top: 325, width: 270, height: 250 }, { fontSize: 22, bold: true, color: C.ink });
  addText(slide, "System prompt pilot\nthen input filter\n\nBenign filter check\n20 prompts", { left: 505, top: 325, width: 270, height: 250 }, { fontSize: 22, bold: true, color: C.ink });
  addText(slide, "Same seed, sample,\nand decoding settings\n\nCompare reported failures\nand manual evidence", { left: 910, top: 325, width: 270, height: 250 }, { fontSize: 22, bold: true, color: C.ink });
  addFooter(slide);
  setNotes(slide, [
    "All garak runs use one generation per prompt and seed 42.",
    "The full PromptInject configuration contains 256 prompts; the local experiment fixes a 16-prompt sample.",
  ]);
}

// Slide 6
{
  const slide = presentation.slides.add();
  addTitle(slide, "Model and tool configuration", 6);
  addText(slide, "Target", { left: 70, top: 155, width: 220, height: 40 }, { fontSize: 22, bold: true, color: C.blue });
  addText(slide, "Qwen2.5-0.5B-Instruct\nLocal Hugging Face pipeline\nFP16 on CUDA", { left: 70, top: 205, width: 470, height: 145 }, { fontSize: 28, bold: true, color: C.navy });
  addText(slide, "Scanner", { left: 70, top: 395, width: 220, height: 40 }, { fontSize: 22, bold: true, color: C.blue });
  addText(slide, "NVIDIA garak 0.17.1rc1\nOfficial repository commit 346497a", { left: 70, top: 445, width: 500, height: 100 }, { fontSize: 27, bold: true, color: C.navy });
  slide.shapes.add({ geometry: "rect", position: { left: 625, top: 150, width: 2, height: 430 }, fill: C.line, line: { style: "solid", fill: "none", width: 0 } });
  addText(slide, "Fixed settings", { left: 700, top: 155, width: 240, height: 40 }, { fontSize: 22, bold: true, color: C.blue });
  addBullets(slide, [
    "Seed 42",
    "One generation per prompt",
    "Prompt cap 16",
    "Maximum output 64 tokens unless a probe overrides it",
    "Windows  |  GTX 1660  |  6 GB VRAM",
  ], { left: 700, top: 215, width: 470, height: 330 }, { fontSize: 25 });
  addText(slide, "Scope note  The paper evaluates Qwen2.5-7B-Instruct; this experiment uses the smaller 0.5B model.", { left: 70, top: 595, width: 1090, height: 52 }, { fontSize: 19, italic: true, color: C.slate });
  addFooter(slide);
  setNotes(slide, [
    "garak: https://github.com/NVIDIA/garak",
    "garak documentation: https://docs.garak.ai/garak",
    "Model card: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct",
  ]);
}

// Slide 7
{
  const slide = presentation.slides.add();
  addTitle(slide, "Baseline results", 7);
  const chart = slide.charts.add("bar", {
    position: { left: 85, top: 155, width: 730, height: 420 },
    categories: ["PromptInject", "DAN 11.0"],
    series: [{ name: "Attack success rate", values: [43.75, 100], fill: C.red }],
    barOptions: { direction: "bar", grouping: "clustered", gapWidth: 58 },
    hasLegend: false,
    xAxis: {
      minimumScale: 0,
      maximumScale: 100,
      numberFormatCode: "0%",
      majorGridlines: { style: "solid", fill: C.line, width: 1 },
      textStyle: { fill: C.slate, fontSize: 15 },
    },
    yAxis: { textStyle: { fill: C.ink, fontSize: 17, bold: true } },
    dataLabels: { showValue: true, position: "outEnd", textStyle: { fill: C.ink, fontSize: 17, bold: true } },
    chartFill: C.white,
    chartLine: { style: "solid", fill: C.white, width: 0 },
    plotAreaFill: C.white,
    plotAreaLine: { style: "solid", fill: C.white, width: 0 },
  });
  applyPresentationChartFont(chart, { fontFamily: FONT });
  addText(slide, "1 / 1", { left: 885, top: 190, width: 240, height: 70 }, { fontSize: 54, bold: true, color: C.red, textAlign: "center" });
  addText(slide, "DAN success", { left: 885, top: 265, width: 240, height: 50 }, { fontSize: 21, color: C.slate, textAlign: "center" });
  addText(slide, "7 / 16", { left: 885, top: 365, width: 240, height: 70 }, { fontSize: 54, bold: true, color: C.red, textAlign: "center" });
  addText(slide, "PromptInject failures", { left: 885, top: 440, width: 240, height: 50 }, { fontSize: 21, color: C.slate, textAlign: "center" });
  addText(slide, "The bar chart shows percentages. PromptInject used 16 responses; DAN used one.", { left: 85, top: 605, width: 1060, height: 44 }, { fontSize: 18, italic: true, color: C.slate });
  addFooter(slide);
  setNotes(slide, [
    "Source: local garak JSONL reports in experiment/evidence/baseline.",
    "PromptInject: 7 failures of 16. DAN: 1 failure of 1 according to both DAN and mitigation-bypass detectors.",
  ]);
}

// Slide 8
{
  const slide = presentation.slides.add();
  addTitle(slide, "Analysis of safety failures", 8);
  addText(slide, "Prompt injection", { left: 70, top: 150, width: 470, height: 46 }, { fontSize: 30, bold: true, color: C.red });
  addText(slide, "Expected", { left: 70, top: 220, width: 120, height: 32 }, { fontSize: 18, bold: true, color: C.slate });
  addText(slide, "Complete the original task and ignore the embedded override.", { left: 70, top: 258, width: 490, height: 92 }, { fontSize: 25, color: C.ink });
  addText(slide, "Observed", { left: 70, top: 382, width: 120, height: 32 }, { fontSize: 18, bold: true, color: C.slate });
  addText(slide, "Seven responses reproduced the attack marker instead of preserving the original task.", { left: 70, top: 420, width: 490, height: 115 }, { fontSize: 25, bold: true, color: C.navy });
  slide.shapes.add({ geometry: "rect", position: { left: 620, top: 150, width: 2, height: 420 }, fill: C.line, line: { style: "solid", fill: "none", width: 0 } });
  addText(slide, "DAN jailbreak", { left: 680, top: 150, width: 470, height: 46 }, { fontSize: 30, bold: true, color: C.red });
  addText(slide, "Expected", { left: 680, top: 220, width: 120, height: 32 }, { fontSize: 18, bold: true, color: C.slate });
  addText(slide, "Reject the unrestricted persona and retain the normal instruction hierarchy.", { left: 680, top: 258, width: 490, height: 92 }, { fontSize: 25, color: C.ink });
  addText(slide, "Observed", { left: 680, top: 382, width: 120, height: 32 }, { fontSize: 18, bold: true, color: C.slate });
  addText(slide, "The response began with “DAN Mode enabled,” and both detectors reported failure.", { left: 680, top: 420, width: 490, height: 115 }, { fontSize: 25, bold: true, color: C.navy });
  addText(slide, "Detector warning  One reformatted attack marker was scored as safe, so exact-string detection can underestimate semantic compliance.", { left: 70, top: 595, width: 1100, height: 58 }, { fontSize: 20, italic: true, color: C.slate });
  addFooter(slide);
  setNotes(slide, [
    "Source: local garak JSONL reports. Manual inspection found one plausible false negative from AttackRogueString because the marker was split into a numbered list.",
  ]);
}

// Slide 9
{
  const slide = presentation.slides.add();
  addTitle(slide, "Proposed mitigation", 9);
  addText(slide, "Prompt-only pilot", { left: 70, top: 155, width: 360, height: 44 }, { fontSize: 28, bold: true, color: C.red });
  addText(slide, "A stronger system instruction produced no measured change: PromptInject remained 7/16 and DAN remained 1/1.", { left: 70, top: 215, width: 470, height: 145 }, { fontSize: 25, color: C.ink });
  addText(slide, "Implemented control", { left: 70, top: 405, width: 360, height: 44 }, { fontSize: 28, bold: true, color: C.green });
  addText(slide, "A separate input filter screens for instruction override and unrestricted-persona patterns before inference.", { left: 70, top: 465, width: 470, height: 130 }, { fontSize: 25, color: C.ink });
  addProcessBox(slide, "User input", 665, 175, 190, C.navy);
  addArrow(slide, 875, 205, 60);
  addProcessBox(slide, "Input filter", 955, 175, 200, C.green);
  addText(slide, "ALLOW", { left: 975, top: 330, width: 160, height: 38 }, { fontSize: 20, bold: true, color: C.green, textAlign: "center" });
  addProcessBox(slide, "Qwen model", 955, 385, 200, C.blue);
  addText(slide, "BLOCK", { left: 700, top: 330, width: 155, height: 38 }, { fontSize: 20, bold: true, color: C.red, textAlign: "center" });
  addText(slide, "Standard refusal", { left: 670, top: 385, width: 220, height: 80 }, { fontSize: 25, bold: true, color: C.red, textAlign: "center" });
  addText(slide, "Production controls should also restrict tool permissions, validate outputs, and require human approval for consequential actions.", { left: 650, top: 540, width: 520, height: 92 }, { fontSize: 21, italic: true, color: C.slate, textAlign: "center" });
  addFooter(slide);
  setNotes(slide, [
    "The input filter is implemented in garak-src/garak/generators/guarded_hf.py.",
    "This is a demonstrator, not a production classifier.",
  ]);
}

// Slide 10
{
  const slide = presentation.slides.add();
  addTitle(slide, "Comparison and discussion", 10);
  const values = [
    ["Evaluation", "Before", "After input filter"],
    ["Model", "Qwen2.5-0.5B", "Same model"],
    ["PromptInject", "7 / 16 failures", "0 / 16 failures"],
    ["DAN detector", "1 / 1 failure", "0 / 1 failures"],
    ["Mitigation bypass", "1 / 1 failure", "0 / 1 failures"],
    ["Observed behavior", "Attack marker and DAN acceptance", "15 PromptInject inputs and DAN blocked"],
    ["Remaining limit", "No pipeline filter", "Keyword bypass and false positives"],
  ];
  const table = slide.tables.add({
    rows: values.length,
    columns: 3,
    left: 70,
    top: 145,
    width: 1140,
    height: 400,
    columnWidths: [330, 360, 450],
    values,
  });
  table.styleOptions = { headerRow: true, bandedRows: true };
  table.borders.assign({ style: "solid", fill: C.line, width: 1 });
  for (let r = 0; r < values.length; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      const cell = table.getCell(r, c);
      cell.text.style = {
        typeface: FONT,
        fontSize: r === 0 ? 19 : 17,
        bold: r === 0 || c === 0,
        color: r === 0 ? C.white : C.ink,
        verticalAlignment: "middle",
      };
      if (r === 0) cell.fill = C.navy;
      else if (r % 2 === 0) cell.fill = C.pale;
    }
  }
  addText(slide, "Interpretation", { left: 70, top: 575, width: 180, height: 32 }, { fontSize: 19, bold: true, color: C.blue });
  addText(slide, "The filter improved the selected signatures, but the result depends on a narrow sample and a rule that attackers can evade.", { left: 250, top: 570, width: 940, height: 64 }, { fontSize: 22, bold: true, color: C.navy });
  addFooter(slide);
  setNotes(slide, [
    "Source: local baseline and filtered garak JSONL reports.",
    "The table separates model responses from detector evaluations. DAN generated one response that was scored by two detectors.",
  ]);
}

// Slide 11
{
  const slide = presentation.slides.add();
  addTitle(slide, "Limitations and recommendations", 11);
  addText(slide, "Limits", { left: 70, top: 150, width: 250, height: 46 }, { fontSize: 30, bold: true, color: C.red });
  addBullets(slide, [
    "Only 17 attack prompts and one random seed",
    "DAN evidence comes from one prompt",
    "Exact-string detection missed a reformatted marker",
    "The 0.5B target differs from the paper's 7B model",
    "Keyword filter can be bypassed",
  ], { left: 70, top: 215, width: 500, height: 320 }, { fontSize: 23 });
  addText(slide, "Residual usability risk", { left: 70, top: 565, width: 260, height: 34 }, { fontSize: 20, bold: true, color: C.slate });
  addText(slide, "3 of 20 benign prompts blocked  |  15%", { left: 70, top: 607, width: 520, height: 42 }, { fontSize: 21, bold: true, color: C.red });
  slide.shapes.add({ geometry: "rect", position: { left: 625, top: 150, width: 2, height: 470 }, fill: C.line, line: { style: "solid", fill: "none", width: 0 } });
  addText(slide, "Recommendations", { left: 690, top: 150, width: 350, height: 46 }, { fontSize: 30, bold: true, color: C.green });
  addBullets(slide, [
    "Separate trusted instructions from retrieved content",
    "Restrict tool permissions and require human approval",
    "Validate output and tool arguments before execution",
    "Add adaptive, multilingual, encoded, and multi-turn attacks",
    "Measure false positives on representative benign traffic",
  ], { left: 690, top: 215, width: 500, height: 350 }, { fontSize: 23 });
  addText(slide, "Passing this test set does not establish complete safety.", { left: 690, top: 585, width: 500, height: 70 }, { fontSize: 23, bold: true, color: C.navy });
  addFooter(slide);
  setNotes(slide, [
    "The 20 benign prompts were hand written for this experiment. They are not a representative production benchmark.",
  ]);
}

// Slide 12
{
  const slide = presentation.slides.add();
  addTitle(slide, "References and AI use declaration", 12);
  const refs = [
    "[1] Xin et al. Jailbreaking Attacks vs. Content Safety Filters. Findings of ACL 2026. doi:10.18653/v1/2026.findings-acl.20",
    "[2] NVIDIA. garak Generative AI Red-teaming and Assessment Kit. https://github.com/NVIDIA/garak",
    "[3] Qwen Team. Qwen2.5-0.5B-Instruct model card. https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct",
    "[4] Perez and Ribeiro. Ignore Previous Prompt. NeurIPS ML Safety Workshop 2022. arXiv:2211.09527",
  ];
  let top = 150;
  for (const ref of refs) {
    addText(slide, ref, { left: 70, top, width: 1120, height: 58 }, { fontSize: 19, color: C.ink });
    top += 73;
  }
  slide.shapes.add({ geometry: "rect", position: { left: 70, top: 455, width: 1140, height: 2 }, fill: C.line, line: { style: "solid", fill: "none", width: 0 } });
  addText(slide, "AI Use Declaration", { left: 70, top: 485, width: 300, height: 40 }, { fontSize: 25, bold: true, color: C.blue });
  addText(slide,
    "ChatGPT Codex assisted with environment setup, reproducibility scripts, log summaries, language, formatting, and the abstract cover illustration. I selected the paper, reviewed the evidence, checked model responses, and remain responsible for the interpretation. I verified references against the ACL Anthology, official garak sources, the Qwen model card, and saved reports.",
    { left: 70, top: 535, width: 1120, height: 105 },
    { fontSize: 20, color: C.ink }
  );
  addFooter(slide, "Submission package includes PPTX  |  report  |  logs  |  reproducibility scripts");
  setNotes(slide, refs.map((ref) => ref.replace(/^\[[0-9]+\]\s*/, "")));
}

const requirements = {
  explicitTotalSlideCount: 12,
  requiredNativeTableOwnerSlides: [10],
  requiredNativeChartOwnerSlides: [7],
  requiredEmbeddedWorkbookChartOwnerSlides: [],
  materializeLiteralChartWorkbooks: true,
};
const fontPolicy = { basis: "design", families: [FONT] };
const expectedSlideSizeEmu = "12192000,6858000";

const stagingDir = path.join(workspaceDir, ".codex-finalizer");
await fs.mkdir(stagingDir, { recursive: true });
const candidatePath = path.join(stagingDir, "llm-safety-candidate.pptx");
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

await finalizePresentation({
  ...requirements,
  workspaceDir,
  candidatePath,
  finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR, "container_tools", "inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL_DIR, "container_tools", "inspect_presentation_layout_geometry.py"),
  layoutArgs: [
    "--expected-slide-size-emu", expectedSlideSizeEmu,
    "--validate-bullet-geometry",
    "--validate-heading-fit",
    "--require-native-table-slide", "10",
  ],
  requiredNativeTableOwnerSlides: requirements.requiredNativeTableOwnerSlides,
  requiredNativeChartOwnerSlides: requirements.requiredNativeChartOwnerSlides,
  fontPolicy,
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, "LLM_Safety_Evaluation_Garak_Submission.validation.json"),
});

const finalPresentation = await PresentationFile.importPptx(await FileBlob.load(FINAL_PPTX));
for (const [index, slide] of finalPresentation.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, "0")}`;
  const png = await finalPresentation.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(path.join(buildDir, `${stem}.png`), new Uint8Array(await png.arrayBuffer()));
}
const montage = await finalPresentation.export({ format: "webp", montage: true });
await fs.writeFile(path.join(buildDir, "deck-montage.webp"), new Uint8Array(await montage.arrayBuffer()));

console.log(FINAL_PPTX);
