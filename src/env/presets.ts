import { execute, process } from "../bridges/index.js";
import { dataset } from "../data/dataset.js";
import { metric, ran, score } from "../verify/score.js";
import { environment } from "./environment.js";

export const PAINT_PROMPTS = [
  "Paint a sunset over water using JavaScript canvas.",
  "Paint a night sky with a moon using JavaScript canvas.",
  "Paint a simple tree and grass using JavaScript canvas.",
];

export function paintEnvironment(prompts: string[] = PAINT_PROMPTS) {
  return environment({
    name: "paint-js",
    tasks: prompts.map((prompt, i) => ({ id: `paint-${i}`, prompt })),
    bridge: execute({ runtime: "canvas", size: 64 }),
    verifier: score(ran(2), metric("coverage", 2), metric("colorDiversity", 2), metric("bbox", 1)),
  });
}

export function paintCorpus() {
  return dataset([
    {
      prompt: "Paint a sunset over water using JavaScript canvas.",
      target: `const c=document.getElementById('c');const x=c.getContext('2d');
x.fillStyle='#1e3a8a';x.fillRect(0,0,64,40);
x.fillStyle='#ea580c';x.fillRect(0,28,64,12);
x.fillStyle='#eab308';x.beginPath();x.arc(44,22,8,0,6.28);x.fill();
x.fillStyle='#1d4ed8';x.fillRect(0,40,64,24);`,
    },
    {
      prompt: "Paint a night sky with a moon using JavaScript canvas.",
      target: `const c=document.getElementById('c');const x=c.getContext('2d');
x.fillStyle='#0f172a';x.fillRect(0,0,64,64);
x.fillStyle='#f8fafc';x.beginPath();x.arc(46,16,7,0,6.28);x.fill();
x.fillStyle='#334155';x.fillRect(0,48,64,16);`,
    },
    {
      prompt: "Paint a simple tree and grass using JavaScript canvas.",
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
