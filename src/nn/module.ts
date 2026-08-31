import { Tensor } from "../tensor/tensor.js";

export abstract class Module {
  abstract parameters(): Tensor[];

  zeroGrad(): void {
    for (const p of this.parameters()) p.zeroGrad();
  }
}

export function collect(modules: Module[]): Tensor[] {
  return modules.flatMap((m) => m.parameters());
}
