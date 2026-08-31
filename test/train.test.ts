import { describe, expect, it } from "vitest";
import { createModel } from "../src/nn/gpt.js";
import { CharTokenizer } from "../src/nn/tokenizer.js";
import { dataset } from "../src/data/dataset.js";
import { sft } from "../src/train/sft.js";
import { createTrainer } from "../src/train/trainer.js";
import { advantages, groupByTask } from "../src/train/advantage.js";
import { execute, match, process, reformulate } from "../src/bridges/index.js";
import { prefer } from "../src/train/dpo.js";
import { processMethod } from "../src/train/process.js";
import { mix } from "../src/train/mix.js";
import { exportGroups } from "../src/env/export.js";
import { splitThought } from "../src/runtime/extract.js";

describe("training", () => {
  it("SFT drives next-token loss down on a tiny corpus", async () => {
    const text = "hello hello hello";
    const tok = CharTokenizer.fromText(text + " ");
    const model = createModel(tok, { dim: 16, layers: 1, heads: 2, context: 16, seed: 3 });
    const data = dataset([{ prompt: "", target: text }]);
    const trainer = createTrainer({
      model,
      method: sft(),
      epochs: 12,
      batchSize: 1,
      optimizer: { lr: 8e-3, weightDecay: 0 },
    });
    const { losses } = await trainer.fit(data);
    expect(losses[losses.length - 1]!).toBeLessThan(losses[0]!);
  });

  it("GRPO advantages are zero-mean", () => {
    const grouped = advantages([
      { task: { prompt: "p" }, completion: { text: "a" }, witness: { ok: true, kind: "match", metrics: {}, logs: [] }, reward: 1 },
      { task: { prompt: "p" }, completion: { text: "b" }, witness: { ok: true, kind: "match", metrics: {}, logs: [] }, reward: 0 },
    ]);
    const mean = grouped.reduce((s, e) => s + e.advantage, 0) / grouped.length;
    expect(Math.abs(mean)).toBeLessThan(1e-9);
  });

  it("execute bridge scores a real sunset sketch above empty output", async () => {
    const bridge = execute({ runtime: "canvas", size: 32 });
    const good = await bridge.run({
      task: { prompt: "sunset" },
      completion: `ctx.fillStyle='orange';ctx.fillRect(0,0,32,16);ctx.fillStyle='blue';ctx.fillRect(0,16,32,16);ctx.fillStyle='gold';ctx.beginPath();ctx.arc(22,10,5,0,6.3);ctx.fill();`,
    });
    const bad = await bridge.run({ task: { prompt: "sunset" }, completion: "nope" });
    expect(good.ok).toBe(true);
    expect(good.metrics.coverage!).toBeGreaterThan(0.2);
    expect(bad.ok).toBe(false);
  });

  it("splits thought from answer for latent training", () => {
    const { thought, answer } = splitThought("Because 2a+2b=2(a+b).\nFinal: the sum is even.");
    expect(thought).toMatch(/2a/);
    expect(answer.toLowerCase()).toMatch(/even/);
  });

  it("prefer prefers the chosen completion", async () => {
    const tok = CharTokenizer.fromText("abcd win lose ");
    const model = createModel(tok, { dim: 16, layers: 1, heads: 2, context: 16, seed: 4 });
    const data = dataset([
      { prompt: "a", chosen: "win", rejected: "lose" },
      { prompt: "b", chosen: "win", rejected: "lose" },
    ]);
    const first = await createTrainer({
      model,
      method: prefer({ beta: 0.5 }),
      epochs: 8,
      batchSize: 2,
      optimizer: { lr: 8e-3, weightDecay: 0 },
    }).fit(data);
    expect(first.last.prefer).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(first.losses.at(-1)!)).toBe(true);
  });

  it("match bridge is exact", async () => {
    const bridge = match({ mode: "exact" });
    const hit = await bridge.run({ task: { prompt: "q", answer: "42" }, completion: "42" });
    const miss = await bridge.run({ task: { prompt: "q", answer: "42" }, completion: "41" });
    expect(hit.ok).toBe(true);
    expect(miss.ok).toBe(false);
  });

  it("process scores step rules", async () => {
    const bridge = process({
      steps: [
        { name: "step", test: /step 1/i },
        { name: "final", test: /final:/i },
      ],
    });
    const hit = await bridge.run({
      task: { prompt: "p" },
      completion: "Step 1: plan.\nFinal: done.",
    });
    const miss = await bridge.run({ task: { prompt: "p" }, completion: "nope" });
    expect(hit.metrics.process).toBe(1);
    expect(miss.metrics.process).toBe(0);
  });

  it("reformulate ranks longer structured text higher", () => {
    const ranks = reformulate().rank(["x", "Step 1\nStep 2\nFinal: a clear answer."]);
    expect(ranks[1]!).toBeGreaterThan(ranks[0]!);
  });

  it("exportGroups writes JSONL with advantages", () => {
    const groups = groupByTask([
      {
        task: { id: "t", prompt: "p" },
        completion: { text: "a" },
        witness: { ok: true, kind: "match", metrics: { match: 1 }, logs: [] },
        reward: 1,
      },
      {
        task: { id: "t", prompt: "p" },
        completion: { text: "b" },
        witness: { ok: true, kind: "match", metrics: { match: 0 }, logs: [] },
        reward: 0,
      },
    ]);
    const row = JSON.parse(exportGroups(groups).split("\n")[0]!);
    expect(row.episodes).toHaveLength(2);
    expect(row.episodes[0].advantage + row.episodes[1].advantage).toBeCloseTo(0);
  });

  it("mix runs both methods without throwing", async () => {
    const tok = CharTokenizer.fromText("step 1 final: ok hello ");
    const model = createModel(tok, { dim: 16, layers: 1, heads: 2, context: 24, seed: 8 });
    const data = dataset([
      { prompt: "why", completion: "Step 1: because.\nFinal: ok." },
    ]);
    const result = await createTrainer({
      model,
      method: mix(
        { method: sft(), weight: 0.5 },
        {
          method: processMethod({
            steps: [
              { name: "step", test: /step 1/i },
              { name: "final", test: /final:/i },
            ],
          }),
          weight: 0.5,
        },
      ),
      epochs: 1,
      batchSize: 1,
      optimizer: { lr: 4e-3, weightDecay: 0 },
    }).fit(data);
    expect(Number.isFinite(result.losses[0]!)).toBe(true);
  });
});
