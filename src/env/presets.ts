import { execute, process } from "../bridges/index.js";
import { dataset } from "../data/dataset.js";
import { gate, metric, ran, score, uses } from "../verify/score.js";
import { environment } from "./environment.js";

/** Allowed canvas calls. A short allowlist beats a long API dump. */
export const CANVAS_API = /fillRect|strokeRect|fillStyle|beginPath|\.arc\(|\.fill\(/;

export const CANVAS_ALLOWLIST = "fillStyle, fillRect, strokeRect, beginPath, arc, fill";

export function canvasPrompt(task: string): string {
  return `${task.trim()}\nAllowed: ${CANVAS_ALLOWLIST}. Nothing else.`;
}

export const PAINT_PROMPTS = [
  "Paint a sunset over water using JavaScript canvas.",
  "Paint a night sky with a moon using JavaScript canvas.",
  "Paint a simple tree and grass using JavaScript canvas.",
];

export function paintEnvironment(prompts: string[] = PAINT_PROMPTS) {
  return environment({
    name: "paint-js",
    tasks: prompts.map((prompt, i) => ({ id: `paint-${i}`, prompt: canvasPrompt(prompt) })),
    bridge: execute({ runtime: "canvas", size: 64 }),
    verifier: score(
      gate(ran()),
      gate(uses(CANVAS_API)),
      metric("coverage"),
      metric("colorDiversity"),
    ),
  });
}

export function paintPool(): string[] {
  return paintCorpus()
    .map((row) => row.target ?? row.completion ?? "")
    .filter(Boolean);
}

export function paintCorpus() {
  return dataset([
    {
      prompt: canvasPrompt("Paint a sunset over water using JavaScript canvas."),
      target: `const c=document.getElementById('c');const x=c.getContext('2d');
x.fillStyle='#1e3a8a';x.fillRect(0,0,64,40);
x.fillStyle='#ea580c';x.fillRect(0,28,64,12);
x.fillStyle='#eab308';x.beginPath();x.arc(44,22,8,0,6.28);x.fill();
x.fillStyle='#1d4ed8';x.fillRect(0,40,64,24);`,
    },
    {
      prompt: canvasPrompt("Paint a night sky with a moon using JavaScript canvas."),
      target: `const c=document.getElementById('c');const x=c.getContext('2d');
x.fillStyle='#0f172a';x.fillRect(0,0,64,64);
x.fillStyle='#f8fafc';x.beginPath();x.arc(46,16,7,0,6.28);x.fill();
x.fillStyle='#334155';x.fillRect(0,48,64,16);`,
    },
    {
      prompt: canvasPrompt("Paint a simple tree and grass using JavaScript canvas."),
      target: `const c=document.getElementById('c');const x=c.getContext('2d');
x.fillStyle='#7dd3fc';x.fillRect(0,0,64,40);
x.fillStyle='#16a34a';x.fillRect(0,40,64,24);
x.fillStyle='#92400e';x.fillRect(28,28,8,20);
x.fillStyle='#15803d';x.beginPath();x.arc(32,24,12,0,6.28);x.fill();`,
    },
  ]);
}

export function proofCorpus() {
  return dataset([
    {
      prompt: "Explain why the sum of two even integers is even. Write steps, then a final sentence.",
      completion:
        "Step 1: an even integer is 2a.\nStep 2: another is 2b.\nStep 3: 2a+2b=2(a+b).\nFinal: the sum is even because it is twice an integer.",
    },
    {
      prompt: "Argue that a square is a rectangle. Write steps, then a final sentence.",
      completion:
        "Step 1: a rectangle has four right angles.\nStep 2: a square has four right angles and equal sides.\nFinal: every square satisfies the rectangle definition.",
    },
  ]);
}

export function processSketch() {
  return process({
    steps: [
      { name: "has-step", test: /step\s*1/i },
      { name: "has-final", test: /final\s*:/i },
    ],
  });
}
