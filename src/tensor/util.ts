export function numel(shape: readonly number[]): number {
  let n = 1;
  for (const d of shape) n *= d;
  return n;
}

export function assertShape(a: readonly number[], b: readonly number[], op: string): void {
  if (a.length !== b.length || a.some((d, i) => d !== b[i])) {
    throw new Error(`${op}: shape mismatch ${fmt(a)} vs ${fmt(b)}`);
  }
}

export function fmt(shape: readonly number[]): string {
  return `[${shape.join(", ")}]`;
}

export function lastDim(shape: readonly number[]): number {
  if (shape.length === 0) throw new Error("empty shape");
  return shape[shape.length - 1]!;
}

export function prefixSize(shape: readonly number[]): number {
  let n = 1;
  for (let i = 0; i < shape.length - 1; i++) n *= shape[i]!;
  return n;
}

/** Mulberry32 — deterministic, tiny, good enough for tests and demos. */
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randn(rand: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
