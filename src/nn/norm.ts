import { Tensor } from "../tensor/tensor.js";
import { lastDim, prefixSize } from "../tensor/util.js";
import { Module } from "./module.js";

export class LayerNorm extends Module {
  readonly gamma: Tensor;
  readonly beta: Tensor;
  readonly eps: number;

  constructor(dim: number, eps = 1e-5) {
    super();
    this.gamma = Tensor.ones([dim], { requiresGrad: true });
    this.beta = Tensor.zeros([dim], { requiresGrad: true });
    this.eps = eps;
  }

  forward(x: Tensor): Tensor {
    const v = lastDim(x.shape);
    const rows = prefixSize(x.shape);
    const out = Tensor.zeros(x.shape, { requiresGrad: true });
    const invStd = new Float64Array(rows);
    const centered = new Float64Array(x.size);

    for (let r = 0; r < rows; r++) {
      const off = r * v;
      let mean = 0;
      for (let j = 0; j < v; j++) mean += x.data[off + j]!;
      mean /= v;
      let varSum = 0;
      for (let j = 0; j < v; j++) {
        const c = x.data[off + j]! - mean;
        centered[off + j] = c;
        varSum += c * c;
      }
      const inv = 1 / Math.sqrt(varSum / v + this.eps);
      invStd[r] = inv;
      for (let j = 0; j < v; j++) {
        out.data[off + j] = centered[off + j]! * inv * this.gamma.data[j]! + this.beta.data[j]!;
      }
    }

    if (x.requiresGrad) {
      out.connect(x, (g) => {
        const dest = x.ensureGrad();
        for (let r = 0; r < rows; r++) {
          const off = r * v;
          const inv = invStd[r]!;
          let gNormSum = 0;
          let gNormDot = 0;
          const gNorm = new Float64Array(v);
          for (let j = 0; j < v; j++) {
            const gn = g[off + j]! * this.gamma.data[j]!;
            gNorm[j] = gn;
            gNormSum += gn;
            gNormDot += gn * centered[off + j]!;
          }
          for (let j = 0; j < v; j++) {
            const c = centered[off + j]!;
            dest[off + j]! += inv * (gNorm[j]! - gNormSum / v - (c * inv * inv * gNormDot) / v);
          }
        }
      });
    }
    out.connect(this.gamma, (g) => {
      const dest = this.gamma.ensureGrad();
      for (let r = 0; r < rows; r++) {
        const off = r * v;
        const inv = invStd[r]!;
        for (let j = 0; j < v; j++) dest[j]! += g[off + j]! * centered[off + j]! * inv;
      }
    });
    out.connect(this.beta, (g) => {
      const dest = this.beta.ensureGrad();
      for (let r = 0; r < rows; r++) {
        const off = r * v;
        for (let j = 0; j < v; j++) dest[j]! += g[off + j]!;
      }
    });
    return out;
  }

  parameters(): Tensor[] {
    return [this.gamma, this.beta];
  }
}
