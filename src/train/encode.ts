import type { TrainableModel } from "../types.js";

export function encodePairs(
  model: TrainableModel,
  pairs: Array<{ prompt: string; completion: string }>,
): number[][] {
  const ctx = model.config.context;
  return pairs.map(({ prompt, completion }) => {
    const prefix = model.tokenizer.encode(prompt, { addBos: true, maxLength: ctx - 2 });
    const rest = model.tokenizer.encode(completion, { addEos: true, maxLength: ctx - prefix.length });
    const ids = [...prefix, ...rest];
    return ids.length < 2 ? [...ids, model.tokenizer.encode(".", {})[0] ?? 0] : ids;
  });
}

export function padTo(model: TrainableModel, rows: number[][]): number[][] {
  const max = Math.min(
    model.config.context,
    Math.max(...rows.map((r) => r.length), 2),
  );
  return model.tokenizer.padBatch(
    rows.map((r) => (r.length > max ? r.slice(0, max) : r)),
    max,
  );
}
