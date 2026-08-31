import { Tensor } from "../tensor/tensor.js";
import { Linear } from "./linear.js";
import { collect, Module } from "./module.js";

export class CausalSelfAttention extends Module {
  readonly q: Linear;
  readonly k: Linear;
  readonly v: Linear;
  readonly proj: Linear;
  readonly heads: number;
  readonly dim: number;

  constructor(dim: number, heads: number, seed: number) {
    super();
    if (dim % heads !== 0) throw new Error("dim must divide heads");
    this.dim = dim;
    this.heads = heads;
    this.q = new Linear(dim, dim, seed);
    this.k = new Linear(dim, dim, seed + 1);
    this.v = new Linear(dim, dim, seed + 2);
    this.proj = new Linear(dim, dim, seed + 3);
  }

  forward(x: Tensor): Tensor {
    const [b, t, c] = x.shape as [number, number, number];
    const h = this.heads;
    const d = c / h;
    const q = splitHeads(this.q.forward(x), b, t, h, d);
    const k = splitHeads(this.k.forward(x), b, t, h, d);
    const v = splitHeads(this.v.forward(x), b, t, h, d);
    const scale = 1 / Math.sqrt(d);
    const scores = batchedHeads(q, k, b, h, t, d, true).mul(scale);
    const masked = causalMask(scores, t);
    const attn = masked.softmax();
    const mixed = batchedHeads(attn, v, b, h, t, d, false);
    const merged = mergeHeads(mixed, b, t, h, d);
    return this.proj.forward(merged);
  }

  parameters(): Tensor[] {
    return collect([this.q, this.k, this.v, this.proj]);
  }
}

function splitHeads(x: Tensor, b: number, t: number, h: number, d: number): Tensor {
  // [B, T, H, D] stored as [B*H, T, D]
  const out = Tensor.zeros([b * h, t, d], { requiresGrad: x.requiresGrad });
  for (let i = 0; i < b; i++) {
    for (let s = 0; s < t; s++) {
      for (let head = 0; head < h; head++) {
        const src = (i * t + s) * h * d + head * d;
        const dst = ((i * h + head) * t + s) * d;
        for (let j = 0; j < d; j++) out.data[dst + j] = x.data[src + j]!;
      }
    }
  }
  if (x.requiresGrad) {
    out.connect(x, (g) => {
      const dest = x.ensureGrad();
      for (let i = 0; i < b; i++) {
        for (let s = 0; s < t; s++) {
          for (let head = 0; head < h; head++) {
            const src = ((i * h + head) * t + s) * d;
            const dst = (i * t + s) * h * d + head * d;
            for (let j = 0; j < d; j++) dest[dst + j]! += g[src + j]!;
          }
        }
      }
    });
  }
  return out;
}

function mergeHeads(x: Tensor, b: number, t: number, h: number, d: number): Tensor {
  const out = Tensor.zeros([b, t, h * d], { requiresGrad: x.requiresGrad });
  for (let i = 0; i < b; i++) {
    for (let s = 0; s < t; s++) {
      for (let head = 0; head < h; head++) {
        const src = ((i * h + head) * t + s) * d;
        const dst = (i * t + s) * h * d + head * d;
        for (let j = 0; j < d; j++) out.data[dst + j] = x.data[src + j]!;
      }
    }
  }
  if (x.requiresGrad) {
    out.connect(x, (g) => {
      const dest = x.ensureGrad();
      for (let i = 0; i < b; i++) {
        for (let s = 0; s < t; s++) {
          for (let head = 0; head < h; head++) {
            const src = (i * t + s) * h * d + head * d;
            const dst = ((i * h + head) * t + s) * d;
            for (let j = 0; j < d; j++) dest[dst + j]! += g[src + j]!;
          }
        }
      }
    });
  }
  return out;
}

/** q @ k^T if transposeK, else attn @ v. Tensors are [B*H, T, D]. */
function batchedHeads(
  left: Tensor,
  right: Tensor,
  b: number,
  h: number,
  t: number,
  d: number,
  transposeK: boolean,
): Tensor {
  if (transposeK) {
    // [BH, T, D] @ [BH, D, T] -> [BH, T, T]
    const kT = transposeLast(right, b * h, t, d);
    return left.matmul(kT);
  }
  // [BH, T, T] @ [BH, T, D] -> [BH, T, D]
  return left.matmul(right);
}

function transposeLast(x: Tensor, bh: number, t: number, d: number): Tensor {
  const out = Tensor.zeros([bh, d, t], { requiresGrad: x.requiresGrad });
  for (let i = 0; i < bh; i++) {
    for (let s = 0; s < t; s++) {
      for (let j = 0; j < d; j++) {
        out.data[i * d * t + j * t + s] = x.data[i * t * d + s * d + j]!;
      }
    }
  }
  if (x.requiresGrad) {
    out.connect(x, (g) => {
      const dest = x.ensureGrad();
      for (let i = 0; i < bh; i++) {
        for (let s = 0; s < t; s++) {
          for (let j = 0; j < d; j++) {
            dest[i * t * d + s * d + j]! += g[i * d * t + j * t + s]!;
          }
        }
      }
    });
  }
  return out;
}

function causalMask(scores: Tensor, t: number): Tensor {
  const out = Tensor.zeros(scores.shape, { requiresGrad: scores.requiresGrad });
  const bh = scores.shape[0]!;
  for (let i = 0; i < bh; i++) {
    for (let q = 0; q < t; q++) {
      for (let k = 0; k < t; k++) {
        const idx = i * t * t + q * t + k;
        out.data[idx] = k > q ? -1e9 : scores.data[idx]!;
      }
    }
  }
  if (scores.requiresGrad) {
    out.connect(scores, (g) => {
      const dest = scores.ensureGrad();
      for (let i = 0; i < bh; i++) {
        for (let q = 0; q < t; q++) {
          for (let k = 0; k < t; k++) {
            if (k <= q) dest[i * t * t + q * t + k]! += g[i * t * t + q * t + k]!;
          }
        }
      }
    });
  }
  return out;
}
