import type { Example, Method, MethodContext, StepResult } from "../types.js";
import { encodePairs, padTo } from "./encode.js";
import { backward } from "./scale.js";

export function sft(): Method {
  return {
    name: "sft",
    step(batch: Example[], ctx: MethodContext): StepResult {
      const pairs = batch.map((row) => ({
        prompt: row.prompt,
        completion: row.target ?? row.completion ?? row.chosen ?? "",
      }));
      const ids = padTo(ctx.model, encodePairs(ctx.model, pairs));
      const loss = ctx.model.loss(ids);
      return { loss: backward(loss, ctx), metrics: { nll: loss.item() } };
    },
  };
}
