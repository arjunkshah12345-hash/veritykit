import { writeFileSync, mkdirSync } from "node:fs";
import { SoftwareCanvas } from "../src/runtime/canvas.js";
import { paintCorpus } from "../src/env/presets.js";

const SCALE = 8;
const DIR = new URL("./out/", import.meta.url);

mkdirSync(DIR, { recursive: true });

const jobs = paintCorpus().map((row, i) => {
  const names = ["sunset", "night", "tree"];
  return { name: names[i]!, src: row.target!, size: 64 };
});

for (const job of jobs) {
  const canvas = new SoftwareCanvas(job.size, job.size);
  const fn = new Function("document", job.src);
  fn({ getElementById: () => ({ getContext: () => canvas }) });
  writeFileSync(new URL(`${job.name}.raw`, DIR), canvas.pixels);
  writeFileSync(
    new URL(`${job.name}.meta.json`, DIR),
    JSON.stringify({ w: canvas.width, h: canvas.height, name: job.name }),
  );
}

// Same programs, coordinates ×8, for the crisp split card.
const scaled = [
  {
    name: "sunset-hi",
    run: (x: SoftwareCanvas) => {
      x.fillStyle = "#1e3a8a";
      x.fillRect(0, 0, 512, 320);
      x.fillStyle = "#ea580c";
      x.fillRect(0, 224, 512, 96);
      x.fillStyle = "#eab308";
      x.beginPath();
      x.arc(352, 176, 64, 0, 6.28);
      x.fill();
      x.fillStyle = "#1d4ed8";
      x.fillRect(0, 320, 512, 192);
    },
  },
  {
    name: "night-hi",
    run: (x: SoftwareCanvas) => {
      x.fillStyle = "#0f172a";
      x.fillRect(0, 0, 512, 512);
      x.fillStyle = "#f8fafc";
      x.beginPath();
      x.arc(368, 128, 56, 0, 6.28);
      x.fill();
      x.fillStyle = "#334155";
      x.fillRect(0, 384, 512, 128);
    },
  },
  {
    name: "tree-hi",
    run: (x: SoftwareCanvas) => {
      x.fillStyle = "#7dd3fc";
      x.fillRect(0, 0, 512, 320);
      x.fillStyle = "#16a34a";
      x.fillRect(0, 320, 512, 192);
      x.fillStyle = "#92400e";
      x.fillRect(224, 224, 64, 160);
      x.fillStyle = "#15803d";
      x.beginPath();
      x.arc(256, 192, 96, 0, 6.28);
      x.fill();
    },
  },
];

for (const job of scaled) {
  const canvas = new SoftwareCanvas(512, 512);
  job.run(canvas);
  writeFileSync(new URL(`${job.name}.raw`, DIR), canvas.pixels);
  writeFileSync(
    new URL(`${job.name}.meta.json`, DIR),
    JSON.stringify({ w: 512, h: 512, name: job.name }),
  );
}

void SCALE;
