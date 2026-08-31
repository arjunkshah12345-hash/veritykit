import { Tensor } from "../tensor/tensor.js";
import type { Bridge, Example, Method, MethodContext, StepResult, Verifier } from "../types.js";
import { defaultVerifier } from "../verify/score.js";
import { advantages } from "./advantage.js";
import { encodePairs, padTo } from "./encode.js";
import { backward } from "./scale.js";

export type ReinforceOptions = {
  bridge: Bridge;
  verifier?: Verifier;
  generations?: number;
  temperature?: number;
  maxTokens?: number;
};

export function reinforce(options: ReinforceOptions): Method {
  const generations = options.generations ?? 4;
  const verifier = options.verifier ?? defaultVerifier(options.bridge);

  return {
    name: "grpo",
    async step(batch: Example[], ctx: MethodContext): Promise<StepResult> {
      const episodes = [];
      for (const task of batch) {
        const scored = [];
        for (let i = 0; i < generations; i++) {
          const text = ctx.model.sample(task.prompt, {
            temperature: options.temperature ?? 0.9,
            maxTokens: options.maxTokens ?? 80,
            seed: (i + 1) * 9973,
          });
          const witness = await options.bridge.run({ task, completion: text });
          scored.push({
            task,
            completion: { text },
            witness,
            reward: await verifier.score({ task, completion: text, witness }),
          });
        }
        episodes.push(...advantages(scored));
      }

      const useful = episodes.filter((e) => Math.abs(e.advantage) > 1e-6);
      const reward = mean(episodes.map((e) => e.reward));
      if (useful.length === 0) return { loss: 0, metrics: { reward, n: episodes.length } };

      const ids = padTo(
        ctx.model,
        encodePairs(
          ctx.model,
          useful.map((e) => ({ prompt: e.task.prompt, completion: e.completion.text })),
        ),
      );
      const lp = ctx.model.logprobs(ids);
      const weights = new Tensor(
        useful.map((e) => -e.advantage),
        [useful.length],
      );
      const loss = lp.mul(weights).mean();
      return { loss: backward(loss, ctx), metrics: { reward, n: episodes.length } };
    },
  };
}

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
}
