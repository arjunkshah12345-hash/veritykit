import { fail } from "../errors.js";
import { assertShape, fmt, lastDim, numel, prefixSize, randn, rng } from "./util.js";

type Edge = {
  parent: Tensor;
  propagate: (outGrad: Float64Array) => void;
};

export type TensorInit = {
  requiresGrad?: boolean;
};

/**
 * Dense tensor with reverse-mode autograd.
 * Data is row-major. Ops used by the trainer are implemented here — nothing more.
 */
export class Tensor {
  readonly data: Float64Array;
  readonly shape: number[];
  readonly size: number;
  readonly requiresGrad: boolean;
  grad: Float64Array | null;
  private readonly edges: Edge[] = [];

  constructor(data: ArrayLike<number>, shape: readonly number[], init: TensorInit = {}) {
    this.shape = [...shape];
    this.size = numel(this.shape);
    if (data.length !== this.size) {
      fail("shape", `data length ${data.length} != ${this.size} for ${fmt(this.shape)}`);
    }
    this.data = data instanceof Float64Array ? data : Float64Array.from(data);
    this.requiresGrad = init.requiresGrad ?? false;
    this.grad = this.requiresGrad ? new Float64Array(this.size) : null;
  }

  static zeros(shape: readonly number[], init: TensorInit = {}): Tensor {
    return new Tensor(new Float64Array(numel(shape)), shape, init);
  }

  static ones(shape: readonly number[], init: TensorInit = {}): Tensor {
    const t = Tensor.zeros(shape, init);
    t.data.fill(1);
    return t;
  }

  static fill(shape: readonly number[], value: number, init: TensorInit = {}): Tensor {
    const t = Tensor.zeros(shape, init);
    t.data.fill(value);
    return t;
  }

  static randn(shape: readonly number[], init: TensorInit & { seed?: number; std?: number } = {}): Tensor {
    const rand = rng(init.seed ?? 0xdecaf);
    const std = init.std ?? 1;
    const t = Tensor.zeros(shape, init);
    for (let i = 0; i < t.size; i++) t.data[i] = randn(rand) * std;
    return t;
  }

  static from(data: ArrayLike<number>, shape?: readonly number[], init: TensorInit = {}): Tensor {
    const s = shape ?? [data.length];
    return new Tensor(data, s, init);
  }

  zeroGrad(): void {
    this.grad?.fill(0);
  }

  detach(): Tensor {
    return new Tensor(this.data, this.shape);
  }

  item(): number {
    if (this.size !== 1) fail("shape", `item() on ${fmt(this.shape)}`);
    return this.data[0]!;
  }

  reshape(shape: readonly number[]): Tensor {
    if (numel(shape) !== this.size) fail("shape", `cannot reshape ${fmt(this.shape)} -> ${fmt(shape)}`);
    const out = new Tensor(this.data, shape, { requiresGrad: this.requiresGrad });
    if (this.requiresGrad) {
      out.connect({
        parent: this,
        propagate: (g) => addInPlace(this.ensureGrad(), g),
      });
    }
    return out;
  }

  transpose(): Tensor {
    if (this.shape.length !== 2) fail("shape", `transpose expects rank 2, got ${fmt(this.shape)}`);
    const [rows, cols] = this.shape as [number, number];
    const out = Tensor.zeros([cols, rows], { requiresGrad: this.requiresGrad });
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        out.data[j * rows + i] = this.data[i * cols + j]!;
      }
    }
    if (this.requiresGrad) {
      out.connect({
        parent: this,
        propagate: (g) => {
          const dest = this.ensureGrad();
          for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
              dest[i * cols + j]! += g[j * rows + i]!;
            }
          }
        },
      });
    }
    return out;
  }

  add(other: Tensor | number): Tensor {
    return binary(
      this,
      other,
      (a, b) => a + b,
      (og, _a, _b) => og,
      (og, _a, _b) => og,
    );
  }

  sub(other: Tensor | number): Tensor {
    return binary(
      this,
      other,
      (a, b) => a - b,
      (og) => og,
      (og) => -og,
    );
  }

  mul(other: Tensor | number): Tensor {
    return binary(
      this,
      other,
      (a, b) => a * b,
      (og, _a, b) => og * b,
      (og, a) => og * a,
    );
  }

  div(other: Tensor | number): Tensor {
    return binary(
      this,
      other,
      (a, b) => a / b,
      (og, _a, b) => og / b,
      (og, a, b) => (-og * a) / (b * b),
    );
  }

  neg(): Tensor {
    return this.mul(-1);
  }

  pow(exp: number): Tensor {
    const out = Tensor.zeros(this.shape, { requiresGrad: this.requiresGrad });
    for (let i = 0; i < this.size; i++) out.data[i] = this.data[i]! ** exp;
    if (this.requiresGrad) {
      out.connect({
        parent: this,
        propagate: (g) => {
          const dest = this.ensureGrad();
          for (let i = 0; i < this.size; i++) {
            dest[i]! += g[i]! * exp * this.data[i]! ** (exp - 1);
          }
        },
      });
    }
    return out;
  }

  exp(): Tensor {
    const out = Tensor.zeros(this.shape, { requiresGrad: this.requiresGrad });
    for (let i = 0; i < this.size; i++) out.data[i] = Math.exp(this.data[i]!);
    if (this.requiresGrad) {
      out.connect({
        parent: this,
        propagate: (g) => {
          const dest = this.ensureGrad();
          for (let i = 0; i < this.size; i++) dest[i]! += g[i]! * out.data[i]!;
        },
      });
    }
    return out;
  }

  log(): Tensor {
    const out = Tensor.zeros(this.shape, { requiresGrad: this.requiresGrad });
    for (let i = 0; i < this.size; i++) out.data[i] = Math.log(this.data[i]!);
    if (this.requiresGrad) {
      out.connect({
        parent: this,
        propagate: (g) => {
          const dest = this.ensureGrad();
          for (let i = 0; i < this.size; i++) dest[i]! += g[i]! / this.data[i]!;
        },
      });
    }
    return out;
  }

  tanh(): Tensor {
    const out = Tensor.zeros(this.shape, { requiresGrad: this.requiresGrad });
    for (let i = 0; i < this.size; i++) out.data[i] = Math.tanh(this.data[i]!);
    if (this.requiresGrad) {
      out.connect({
        parent: this,
        propagate: (g) => {
          const dest = this.ensureGrad();
          for (let i = 0; i < this.size; i++) {
            const y = out.data[i]!;
            dest[i]! += g[i]! * (1 - y * y);
          }
        },
      });
    }
    return out;
  }

  relu(): Tensor {
    const out = Tensor.zeros(this.shape, { requiresGrad: this.requiresGrad });
    for (let i = 0; i < this.size; i++) out.data[i] = Math.max(0, this.data[i]!);
    if (this.requiresGrad) {
      out.connect({
        parent: this,
        propagate: (g) => {
          const dest = this.ensureGrad();
          for (let i = 0; i < this.size; i++) {
            if (this.data[i]! > 0) dest[i]! += g[i]!;
          }
        },
      });
    }
    return out;
  }

  gelu(): Tensor {
    // tanh approximation
    const out = Tensor.zeros(this.shape, { requiresGrad: this.requiresGrad });
    const c = Math.sqrt(2 / Math.PI);
    for (let i = 0; i < this.size; i++) {
      const x = this.data[i]!;
      out.data[i] = 0.5 * x * (1 + Math.tanh(c * (x + 0.044715 * x * x * x)));
    }
    if (this.requiresGrad) {
      out.connect({
        parent: this,
        propagate: (g) => {
          const dest = this.ensureGrad();
          for (let i = 0; i < this.size; i++) {
            const x = this.data[i]!;
            const x3 = x * x * x;
            const u = c * (x + 0.044715 * x3);
            const t = Math.tanh(u);
            const sech2 = 1 - t * t;
            const du = c * (1 + 3 * 0.044715 * x * x);
            dest[i]! += g[i]! * (0.5 * (1 + t) + 0.5 * x * sech2 * du);
          }
        },
      });
    }
    return out;
  }

  sum(): Tensor {
    let s = 0;
    for (let i = 0; i < this.size; i++) s += this.data[i]!;
    const out = new Tensor([s], [], { requiresGrad: this.requiresGrad });
    if (this.requiresGrad) {
      out.connect({
        parent: this,
        propagate: (g) => {
          const dest = this.ensureGrad();
          const v = g[0]!;
          for (let i = 0; i < this.size; i++) dest[i]! += v;
        },
      });
    }
    return out;
  }

  mean(): Tensor {
    return this.sum().div(this.size);
  }

  /**
   * Softmax over the last dimension.
   */
  softmax(): Tensor {
    const v = lastDim(this.shape);
    const rows = prefixSize(this.shape);
    const out = Tensor.zeros(this.shape, { requiresGrad: this.requiresGrad });
    for (let r = 0; r < rows; r++) {
      const off = r * v;
      let max = -Infinity;
      for (let j = 0; j < v; j++) max = Math.max(max, this.data[off + j]!);
      let sum = 0;
      for (let j = 0; j < v; j++) {
        const e = Math.exp(this.data[off + j]! - max);
        out.data[off + j] = e;
        sum += e;
      }
      for (let j = 0; j < v; j++) out.data[off + j]! /= sum;
    }
    if (this.requiresGrad) {
      out.connect({
        parent: this,
        propagate: (g) => {
          const dest = this.ensureGrad();
          for (let r = 0; r < rows; r++) {
            const off = r * v;
            let dot = 0;
            for (let j = 0; j < v; j++) dot += g[off + j]! * out.data[off + j]!;
            for (let j = 0; j < v; j++) {
              dest[off + j]! += out.data[off + j]! * (g[off + j]! - dot);
            }
          }
        },
      });
    }
    return out;
  }

  /**
   * Matrix product.
   * - rank-2: [M, K] @ [K, N] -> [M, N]
   * - rank-3 left: [B, T, K] @ [K, N] -> [B, T, N]
   */
  matmul(other: Tensor): Tensor {
    if (this.shape.length === 2 && other.shape.length === 2) {
      return matmul2d(this, other);
    }
    if (this.shape.length === 3 && other.shape.length === 2) {
      const [b, t, k] = this.shape as [number, number, number];
      if (other.shape[0] !== k) fail("shape", `matmul ${fmt(this.shape)} @ ${fmt(other.shape)}`);
      const flat = this.reshape([b * t, k]).matmul(other);
      return flat.reshape([b, t, other.shape[1]!]);
    }
    if (this.shape.length === 3 && other.shape.length === 3) {
      return batchedMatmul(this, other);
    }
    fail("shape", `unsupported matmul ${fmt(this.shape)} @ ${fmt(other.shape)}`);
  }

  backward(grad?: Tensor | number): void {
    if (!this.requiresGrad) fail("grad", "backward() on a tensor that does not require grad");
    this.ensureGrad();
    if (grad === undefined) {
      if (this.size !== 1) fail("grad", "backward() without grad is only valid for scalars");
      this.grad![0] = 1;
    } else if (typeof grad === "number") {
      if (this.size !== 1) fail("grad", "numeric grad only for scalars");
      this.grad![0] = grad;
    } else {
      assertShape(this.shape, grad.shape, "backward");
      addInPlace(this.grad!, grad.data);
    }

    const order = topo(this);
    for (const node of order) {
      if (!node.grad) continue;
      for (const edge of node.edges) {
        edge.parent.ensureGrad();
        edge.propagate(node.grad);
      }
    }
  }

  ensureGrad(): Float64Array {
    if (!this.grad) this.grad = new Float64Array(this.size);
    return this.grad;
  }

  /** Attach a parent for reverse-mode autograd. Used by nn modules. */
  connect(
    parent: Tensor | { parent: Tensor; propagate: (outGrad: Float64Array) => void },
    propagate?: (outGrad: Float64Array) => void,
  ): this {
    if (typeof propagate === "function") {
      this.edges.push({ parent: parent as Tensor, propagate });
    } else {
      this.edges.push(parent as { parent: Tensor; propagate: (outGrad: Float64Array) => void });
    }
    return this;
  }

  walkParents(fn: (parent: Tensor) => void): void {
    for (const e of this.edges) fn(e.parent);
  }
}

function addInPlace(dest: Float64Array, src: Float64Array): void {
  for (let i = 0; i < dest.length; i++) dest[i]! += src[i]!;
}

function asTensor(value: Tensor | number, like: Tensor): Tensor {
  if (typeof value !== "number") return value;
  return Tensor.fill(like.shape, value);
}

function binary(
  left: Tensor,
  right: Tensor | number,
  fwd: (a: number, b: number) => number,
  dA: (og: number, a: number, b: number) => number,
  dB: (og: number, a: number, b: number) => number,
): Tensor {
  const b = asTensor(right, left);
  if (typeof right !== "number") assertShape(left.shape, b.shape, "binary");
  const needs = left.requiresGrad || b.requiresGrad;
  const out = Tensor.zeros(left.shape, { requiresGrad: needs });
  for (let i = 0; i < left.size; i++) out.data[i] = fwd(left.data[i]!, b.data[i]!);
  if (left.requiresGrad) {
    out.connect({
      parent: left,
      propagate: (g) => {
        const dest = left.ensureGrad();
        for (let i = 0; i < left.size; i++) dest[i]! += dA(g[i]!, left.data[i]!, b.data[i]!);
      },
    });
  }
  if (b.requiresGrad) {
    out.connect({
      parent: b,
      propagate: (g) => {
        const dest = b.ensureGrad();
        for (let i = 0; i < b.size; i++) dest[i]! += dB(g[i]!, left.data[i]!, b.data[i]!);
      },
    });
  }
  return out;
}

function matmul2d(a: Tensor, b: Tensor): Tensor {
  const [m, k] = a.shape as [number, number];
  const [k2, n] = b.shape as [number, number];
  if (k !== k2) fail("shape", `matmul ${fmt(a.shape)} @ ${fmt(b.shape)}`);
  const out = Tensor.zeros([m, n], { requiresGrad: a.requiresGrad || b.requiresGrad });
  for (let i = 0; i < m; i++) {
    for (let p = 0; p < k; p++) {
      const av = a.data[i * k + p]!;
      const row = i * n;
      const brow = p * n;
      for (let j = 0; j < n; j++) out.data[row + j]! += av * b.data[brow + j]!;
    }
  }
  if (a.requiresGrad) {
    out.connect({
      parent: a,
      propagate: (g) => {
        const dest = a.ensureGrad();
        for (let i = 0; i < m; i++) {
          for (let p = 0; p < k; p++) {
            let s = 0;
            const grow = i * n;
            const brow = p * n;
            for (let j = 0; j < n; j++) s += g[grow + j]! * b.data[brow + j]!;
            dest[i * k + p]! += s;
          }
        }
      },
    });
  }
  if (b.requiresGrad) {
    out.connect({
      parent: b,
      propagate: (g) => {
        const dest = b.ensureGrad();
        for (let p = 0; p < k; p++) {
          for (let j = 0; j < n; j++) {
            let s = 0;
            for (let i = 0; i < m; i++) s += a.data[i * k + p]! * g[i * n + j]!;
            dest[p * n + j]! += s;
          }
        }
      },
    });
  }
  return out;
}

function batchedMatmul(a: Tensor, b: Tensor): Tensor {
  const [ba, ta, ka] = a.shape as [number, number, number];
  const [bb, kb, nb] = b.shape as [number, number, number];
  if (ba !== bb || ka !== kb) fail("shape", `bmm ${fmt(a.shape)} @ ${fmt(b.shape)}`);
  const out = Tensor.zeros([ba, ta, nb], { requiresGrad: a.requiresGrad || b.requiresGrad });
  for (let batch = 0; batch < ba; batch++) {
    const aOff = batch * ta * ka;
    const bOff = batch * ka * nb;
    const oOff = batch * ta * nb;
    for (let i = 0; i < ta; i++) {
      for (let p = 0; p < ka; p++) {
        const av = a.data[aOff + i * ka + p]!;
        for (let j = 0; j < nb; j++) {
          out.data[oOff + i * nb + j]! += av * b.data[bOff + p * nb + j]!;
        }
      }
    }
  }
  if (a.requiresGrad) {
    out.connect({
      parent: a,
      propagate: (g) => {
        const dest = a.ensureGrad();
        for (let batch = 0; batch < ba; batch++) {
          const aOff = batch * ta * ka;
          const bOff = batch * ka * nb;
          const oOff = batch * ta * nb;
          for (let i = 0; i < ta; i++) {
            for (let p = 0; p < ka; p++) {
              let s = 0;
              for (let j = 0; j < nb; j++) {
                s += g[oOff + i * nb + j]! * b.data[bOff + p * nb + j]!;
              }
              dest[aOff + i * ka + p]! += s;
            }
          }
        }
      },
    });
  }
  if (b.requiresGrad) {
    out.connect({
      parent: b,
      propagate: (g) => {
        const dest = b.ensureGrad();
        for (let batch = 0; batch < ba; batch++) {
          const aOff = batch * ta * ka;
          const bOff = batch * ka * nb;
          const oOff = batch * ta * nb;
          for (let p = 0; p < ka; p++) {
            for (let j = 0; j < nb; j++) {
              let s = 0;
              for (let i = 0; i < ta; i++) {
                s += a.data[aOff + i * ka + p]! * g[oOff + i * nb + j]!;
              }
              dest[bOff + p * nb + j]! += s;
            }
          }
        }
      },
    });
  }
  return out;
}

function topo(root: Tensor): Tensor[] {
  const seen = new Set<Tensor>();
  const order: Tensor[] = [];
  const walk = (t: Tensor) => {
    if (seen.has(t)) return;
    seen.add(t);
    t.walkParents(walk);
    order.push(t);
  };
  walk(root);
  order.reverse();
  return order;
}

/** Stable cross-entropy. `logits` last dim is vocab, `targets` length = prefix size. */
export function crossEntropy(logits: Tensor, targets: number[], ignoreIndex = -1): Tensor {
  const v = lastDim(logits.shape);
  const rows = prefixSize(logits.shape);
  if (targets.length !== rows) fail("shape", `crossEntropy targets ${targets.length} != ${rows}`);
  let loss = 0;
  let counted = 0;
  for (let r = 0; r < rows; r++) {
    const t = targets[r]!;
    if (t === ignoreIndex) continue;
    const off = r * v;
    if (t < 0 || t >= v) fail("shape", `target ${t} out of vocab ${v}`);
    let max = -Infinity;
    for (let j = 0; j < v; j++) max = Math.max(max, logits.data[off + j]!);
    let sum = 0;
    for (let j = 0; j < v; j++) sum += Math.exp(logits.data[off + j]! - max);
    loss += -(logits.data[off + t]! - max - Math.log(sum));
    counted += 1;
  }
  const denom = Math.max(1, counted);
  loss /= denom;
  const out = new Tensor([loss], [], { requiresGrad: logits.requiresGrad });
  if (logits.requiresGrad) {
    out.connect({
      parent: logits,
      propagate: (g) => {
        const dest = logits.ensureGrad();
        const scale = g[0]! / denom;
        for (let r = 0; r < rows; r++) {
          const t = targets[r]!;
          if (t === ignoreIndex) continue;
          const off = r * v;
          let max = -Infinity;
          for (let j = 0; j < v; j++) max = Math.max(max, logits.data[off + j]!);
          let sum = 0;
          for (let j = 0; j < v; j++) sum += Math.exp(logits.data[off + j]! - max);
          for (let j = 0; j < v; j++) {
            const p = Math.exp(logits.data[off + j]! - max) / sum;
            dest[off + j]! += scale * (p - (j === t ? 1 : 0));
          }
        }
      },
    });
  }
  return out;
}

/** Sum of log-probs of `tokens` under `logits` ([B, T, V] aligned with tokens [B, T]). */
export function gatheredLogprobs(logits: Tensor, tokens: number[][], ignoreIndex = -1): Tensor {
  const [b, t, v] = logits.shape as [number, number, number];
  if (tokens.length !== b) fail("shape", "gatheredLogprobs batch mismatch");
  const out = Tensor.zeros([b], { requiresGrad: logits.requiresGrad });
  for (let i = 0; i < b; i++) {
    let lp = 0;
    for (let s = 0; s < t; s++) {
      const tok = tokens[i]![s]!;
      if (tok === ignoreIndex) continue;
      const off = (i * t + s) * v;
      let max = -Infinity;
      for (let j = 0; j < v; j++) max = Math.max(max, logits.data[off + j]!);
      let sum = 0;
      for (let j = 0; j < v; j++) sum += Math.exp(logits.data[off + j]! - max);
      const p = Math.exp(logits.data[off + tok]! - max) / sum;
      lp += Math.log(Math.max(p, 1e-12));
    }
    out.data[i] = lp;
  }
  if (logits.requiresGrad) {
    out.connect({
      parent: logits,
      propagate: (g) => {
        const dest = logits.ensureGrad();
        for (let i = 0; i < b; i++) {
          for (let s = 0; s < t; s++) {
            const tok = tokens[i]![s]!;
            if (tok === ignoreIndex) continue;
            const off = (i * t + s) * v;
            let max = -Infinity;
            for (let j = 0; j < v; j++) max = Math.max(max, logits.data[off + j]!);
            let sum = 0;
            for (let j = 0; j < v; j++) sum += Math.exp(logits.data[off + j]! - max);
            const scale = g[i]!;
            for (let j = 0; j < v; j++) {
              const p = Math.exp(logits.data[off + j]! - max) / sum;
              dest[off + j]! += scale * ((j === tok ? 1 : 0) - p);
            }
          }
        }
      },
    });
  }
  return out;
}
