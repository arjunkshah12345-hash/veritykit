import { describe, expect, it } from "vitest";
import { execute } from "../src/bridges/index.js";
import { canvasPrompt, paintPool } from "../src/env/presets.js";
import { combine, gate, pairwise, ran, score, uses, verify } from "../src/verify/score.js";

const blank = { ok: true, kind: "execute" as const, metrics: { ran: 1 }, logs: [] };

describe("reward", () => {
  it("gate zeros the score when the program does not run", async () => {
    const { reward } = await verify({
      task: { prompt: "sunset" },
      completion: "nope",
      bridge: execute({ runtime: "canvas", size: 16 }),
      verifier: score(gate(ran()), { name: "full", read: () => 1 }),
    });
    expect(reward).toBe(0);
  });

  it("gates alone pass as 1", async () => {
    const v = score(gate(ran()), gate(uses(/fillRect/)));
    const hit = await v.score({
      task: { prompt: "p" },
      completion: "ctx.fillRect(0,0,1,1)",
      witness: blank,
    });
    expect(hit).toBe(1);
  });

  it("uses requires the allowlist", async () => {
    const v = score(gate(uses(/fillRect/)), { name: "full", read: () => 1 });
    const miss = await v.score({ task: { prompt: "p" }, completion: "ctx.invent()", witness: blank });
    const hit = await v.score({
      task: { prompt: "p" },
      completion: "ctx.fillRect(0,0,1,1)",
      witness: blank,
    });
    expect(miss).toBe(0);
    expect(hit).toBe(1);
  });

  it("pairwise samples n references", async () => {
    const seen = new Set<string>();
    const v = pairwise({
      references: ["a", "b", "c", "d"],
      n: 1,
      seed: 7,
      compare: ({ against }) => {
        seen.add(against);
        return 1;
      },
    });
    await v.score({ task: { prompt: "p" }, completion: "x", witness: blank });
    expect(seen.size).toBe(1);
  });

  it("pairwise is a win rate", async () => {
    const v = pairwise({
      references: ["good", "also"],
      compare: ({ candidate, against }) => Number(candidate.length > against.length),
    });
    const r = await v.score({
      task: { prompt: "p" },
      completion: "a much longer sketch than the refs",
      witness: blank,
    });
    expect(r).toBe(1);
  });

  it("combine of only gates returns 1", async () => {
    const v = combine({ verifier: score(gate(ran())), gate: true });
    const hit = await v.score({ task: { prompt: "p" }, completion: "x", witness: blank });
    expect(hit).toBe(1);
  });

  it("combine can gate the rest", async () => {
    const v = combine(
      { verifier: score(gate(ran())), gate: true },
      { verifier: { score: () => 1 }, weight: 1 },
    );
    const dead = await v.score({
      task: { prompt: "p" },
      completion: "x",
      witness: { ok: false, kind: "execute", metrics: { ran: 0 }, logs: [] },
    });
    expect(dead).toBe(0);
  });

  it("canvasPrompt is an allowlist", () => {
    const prompt = canvasPrompt("sunset");
    expect(prompt).toContain("Allowed:");
    expect(prompt).not.toMatch(/getImageData|quadraticCurveTo/);
  });

  it("paintPool is working programs", () => {
    const pool = paintPool();
    expect(pool.length).toBe(3);
    expect(pool.every((p) => /fillRect/.test(p))).toBe(true);
  });
});
