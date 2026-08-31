import type { Tensor } from "../tensor/tensor.js";
import type { MethodContext } from "../types.js";

/** Scale a loss for `mix()`, then backward. Returns the unscaled value for logs. */
export function backward(loss: Tensor, ctx: MethodContext): number {
  const scale = ctx.scale ?? 1;
  const trained = scale === 1 ? loss : loss.mul(scale);
  trained.backward();
  return loss.item();
}
