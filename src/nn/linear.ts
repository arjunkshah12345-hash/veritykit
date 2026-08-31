import { Tensor } from "../tensor/tensor.js";
import { Module } from "./module.js";

export class Linear extends Module {
  readonly weight: Tensor;
  readonly bias: Tensor;

  constructor(input: number, output: number, seed: number) {
    super();
    const std = 1 / Math.sqrt(input);
    this.weight = Tensor.randn([output, input], { requiresGrad: true, seed, std });
    this.bias = Tensor.zeros([output], { requiresGrad: true });
  }

  forward(x: Tensor): Tensor {
    return addBias(x.matmul(this.weight.transpose()), this.bias);
  }

  parameters(): Tensor[] {
    return [this.weight, this.bias];
  }
}

function addBias(x: Tensor, bias: Tensor): Tensor {
  const last = x.shape[x.shape.length - 1]!;
  if (bias.size !== last) throw new Error("bias size mismatch");
  const out = Tensor.zeros(x.shape, { requiresGrad: x.requiresGrad || bias.requiresGrad });
  const rows = x.size / last;
  for (let r = 0; r < rows; r++) {
    const off = r * last;
    for (let j = 0; j < last; j++) out.data[off + j] = x.data[off + j]! + bias.data[j]!;
  }
  if (x.requiresGrad) {
    out.connect(x, (g) => {
      const dest = x.ensureGrad();
      for (let i = 0; i < x.size; i++) dest[i]! += g[i]!;
    });
  }
  if (bias.requiresGrad) {
    out.connect(bias, (g) => {
      const dest = bias.ensureGrad();
      for (let r = 0; r < rows; r++) {
        const off = r * last;
        for (let j = 0; j < last; j++) dest[j]! += g[off + j]!;
      }
    });
  }
  return out;
}
