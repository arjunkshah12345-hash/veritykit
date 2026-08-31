import type { Example, Method, MethodContext, StepResult } from "../types.js";
import { encodePairs, padTo } from "./encode.js";
import { backward } from "./scale.js";

export type DpoOptions = {
  beta?: number;
};

/**
 * Preference training. Uses the current policy as its own reference
 * (implicit reference) so a second frozen copy is not required.
 *
 * Loss is `-log σ(β (logπ(y_w) − logπ(y_l)))`.
 */
export function prefer(options: DpoOptions = {}): Method {
  const beta = options.beta ?? 0.1;
  return {
    name: "dpo",
    step(batch: Example[], ctx: MethodContext): StepResult {
      const pairs = batch.filter((row) => row.chosen && row.rejected);
      if (pairs.length === 0) return { loss: 0, metrics: { skipped: 1 } };

      const win = padTo(
        ctx.model,
        encodePairs(
          ctx.model,
          pairs.map((row) => ({ prompt: row.prompt, completion: row.chosen! })),
        ),
      );
      const lose = padTo(
        ctx.model,
        encodePairs(
          ctx.model,
          pairs.map((row) => ({ prompt: row.prompt, completion: row.rejected! })),
        ),
      );
      const delta = ctx.model.logprobs(win).sub(ctx.model.logprobs(lose));
      const loss = delta.mul(-beta).exp().add(1).log().mean();
      let margin = 0;
      let wins = 0;
      for (let i = 0; i < pairs.length; i++) {
        const d = delta.data[i]!;
        margin += d;
        if (d > 0) wins += 1;
      }
      return {
        loss: backward(loss, ctx),
        metrics: { prefer: wins / pairs.length, margin: margin / pairs.length },
      };
    },
  };
}
