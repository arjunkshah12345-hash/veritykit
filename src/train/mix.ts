import type { Example, Method, MethodContext, StepResult } from "../types.js";

/**
 * Run methods on the same batch. Gradients accumulate. The trainer steps once.
 * `weight` scales each method's loss before backward.
 */
export function mix(...parts: Array<{ method: Method; weight?: number }>): Method {
  const total = parts.reduce((s, p) => s + (p.weight ?? 1), 0) || 1;
  return {
    name: "mix",
    async step(batch: Example[], ctx: MethodContext): Promise<StepResult> {
      const metrics: Record<string, number> = {};
      let loss = 0;
      for (const part of parts) {
        const weight = (part.weight ?? 1) / total;
        const result = await part.method.step(batch, { ...ctx, scale: (ctx.scale ?? 1) * weight });
        loss += result.loss * weight;
        for (const [k, v] of Object.entries(result.metrics)) {
          metrics[`${part.method.name}.${k}`] = v;
        }
      }
      metrics.loss = loss;
      return { loss, metrics };
    },
  };
}
