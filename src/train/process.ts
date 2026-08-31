import { Tensor } from "../tensor/tensor.js";
import { process as processBridge } from "../bridges/index.js";
import type { Example, Method, MethodContext, StepResult } from "../types.js";
import { encodePairs, padTo } from "./encode.js";
import { backward } from "./scale.js";

export type ProcessOptions = {
  steps: Parameters<typeof processBridge>[0]["steps"];
  rewardWeight?: number;
};

/**
 * Verifiable process rewards: deterministic checks on intermediate structure,
 * then a token-level loss weighted by how many steps passed.
 */
export function processMethod(options: ProcessOptions): Method {
  const bridge = processBridge({ steps: options.steps });
  const rewardWeight = options.rewardWeight ?? 1;

  return {
    name: "process",
    async step(batch: Example[], ctx: MethodContext): Promise<StepResult> {
      const pairs = [];
      const weights: number[] = [];
      let passed = 0;
      for (const row of batch) {
        const text = row.completion ?? row.target ?? "";
        const witness = await bridge.run({ task: row, completion: text });
        const ratio = witness.metrics.process ?? 0;
        passed += ratio;
        pairs.push({ prompt: row.prompt, completion: text });
        weights.push(0.25 + rewardWeight * ratio);
      }
      const lp = ctx.model.logprobs(padTo(ctx.model, encodePairs(ctx.model, pairs)));
      const w = new Tensor(
        weights.map((x) => -x),
        [weights.length],
      );
      const loss = lp.mul(w).mean();
      return {
        loss: backward(loss, ctx),
        metrics: { process: passed / Math.max(1, batch.length) },
      };
    },
  };
}
