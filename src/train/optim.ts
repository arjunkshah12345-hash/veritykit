import type { Tensor } from "../tensor/tensor.js";

export type AdamConfig = {
  lr?: number;
  beta1?: number;
  beta2?: number;
  eps?: number;
  weightDecay?: number;
};

export class Adam {
  readonly lr: number;
  readonly beta1: number;
  readonly beta2: number;
  readonly eps: number;
  readonly weightDecay: number;
  private readonly m = new WeakMap<Tensor, Float64Array>();
  private readonly v = new WeakMap<Tensor, Float64Array>();
  private t = 0;

  constructor(config: AdamConfig = {}) {
    this.lr = config.lr ?? 3e-3;
    this.beta1 = config.beta1 ?? 0.9;
    this.beta2 = config.beta2 ?? 0.999;
    this.eps = config.eps ?? 1e-8;
    this.weightDecay = config.weightDecay ?? 0.01;
  }

  step(params: Tensor[]): void {
    this.t += 1;
    const b1t = 1 - this.beta1 ** this.t;
    const b2t = 1 - this.beta2 ** this.t;
    for (const p of params) {
      if (!p.grad) continue;
      let m = this.m.get(p);
      let v = this.v.get(p);
      if (!m) {
        m = new Float64Array(p.size);
        v = new Float64Array(p.size);
        this.m.set(p, m);
        this.v.set(p, v!);
      }
      for (let i = 0; i < p.size; i++) {
        const g = p.grad[i]! + this.weightDecay * p.data[i]!;
        m[i] = this.beta1 * m[i]! + (1 - this.beta1) * g;
        v![i] = this.beta2 * v![i]! + (1 - this.beta2) * g * g;
        const mhat = m[i]! / b1t;
        const vhat = v![i]! / b2t;
        p.data[i]! -= (this.lr * mhat) / (Math.sqrt(vhat) + this.eps);
      }
    }
  }
}
