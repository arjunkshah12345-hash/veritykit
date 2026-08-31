import { Tensor } from "../tensor/tensor.js";
import { Module } from "./module.js";

export class Embedding extends Module {
  readonly weight: Tensor;

  constructor(vocab: number, dim: number, seed: number) {
    super();
    this.weight = Tensor.randn([vocab, dim], { requiresGrad: true, seed, std: 0.02 });
  }

  forward(ids: number[][]): Tensor {
    const b = ids.length;
    const t = ids[0]?.length ?? 0;
    const [, dim] = this.weight.shape as [number, number];
    const out = Tensor.zeros([b, t, dim], { requiresGrad: this.weight.requiresGrad });
    for (let i = 0; i < b; i++) {
      if (ids[i]!.length !== t) throw new Error("ragged token batch");
      for (let s = 0; s < t; s++) {
        const id = ids[i]![s]!;
        const src = id * dim;
        const dst = (i * t + s) * dim;
        for (let j = 0; j < dim; j++) out.data[dst + j] = this.weight.data[src + j]!;
      }
    }
    if (this.weight.requiresGrad) {
      out.connect(this.weight, (g) => {
        const dest = this.weight.ensureGrad();
        for (let i = 0; i < b; i++) {
          for (let s = 0; s < t; s++) {
            const id = ids[i]![s]!;
            const src = (i * t + s) * dim;
            const dst = id * dim;
            for (let j = 0; j < dim; j++) dest[dst + j]! += g[src + j]!;
          }
        }
      });
    }
    return out;
  }

  parameters(): Tensor[] {
    return [this.weight];
  }
}
