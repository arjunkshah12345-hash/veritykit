import type { Example, Method, MethodContext, StepResult } from "../types.js";
import { splitThought } from "../runtime/extract.js";
import { encodePairs, padTo } from "./encode.js";
import { backward } from "./scale.js";

export type LatentOptions = {
  samples?: number;
  temperature?: number;
  maxTokens?: number;
};

/**
 * JEPO-style objective for unverifiable / long-form data.
 *
 * Chain-of-thought is treated as a latent z. We sample K thoughts,
 * take the final span as y, and optimize a multi-sample Jensen bound:
 *
 *   L ≈ -log (1/K ∑_k π(y | x, z_k))
 *
 * plus a light SFT term on the full completion so the thought itself stays fluent.
 * No verifier required.
 */
export function latentMethod(options: LatentOptions = {}): Method {
  const samples = options.samples ?? 3;

  return {
    name: "jepo",
    step(batch: Example[], ctx: MethodContext): StepResult {
      const answerPairs: Array<{ prompt: string; completion: string }> = [];
      const fullPairs: Array<{ prompt: string; completion: string }> = [];

      for (const row of batch) {
        const texts: string[] = [];
        if (row.completion || row.target) texts.push(row.completion ?? row.target ?? "");
        while (texts.length < samples) {
          texts.push(
            ctx.model.sample(row.prompt, {
              temperature: options.temperature ?? 0.8,
              maxTokens: options.maxTokens ?? 64,
              seed: texts.length * 4241 + 7,
            }),
          );
        }
        for (const text of texts) {
          const { thought, answer } = splitThought(text);
          const y = row.answer ?? answer;
          answerPairs.push({
            prompt: [row.prompt, thought].filter(Boolean).join("\n"),
            completion: y || text,
          });
          fullPairs.push({ prompt: row.prompt, completion: text });
        }
      }

      const lp = ctx.model.logprobs(padTo(ctx.model, encodePairs(ctx.model, answerPairs)));
      const k = samples;
      const tasks = batch.length;
      let jensen = 0;
      for (let t = 0; t < tasks; t++) {
        let max = -Infinity;
        for (let s = 0; s < k; s++) max = Math.max(max, lp.data[t * k + s]!);
        let sum = 0;
        for (let s = 0; s < k; s++) sum += Math.exp(lp.data[t * k + s]! - max);
        jensen += -(max + Math.log(sum / k));
      }
      jensen /= Math.max(1, tasks);

      const latentLoss = lp.mean().mul(-1);
      const sftLoss = ctx.model.loss(padTo(ctx.model, encodePairs(ctx.model, fullPairs)));
      const loss = latentLoss.add(sftLoss.mul(0.3));
      return { loss: backward(loss, ctx), metrics: { jensen, nll: sftLoss.item() } };
    },
  };
}
