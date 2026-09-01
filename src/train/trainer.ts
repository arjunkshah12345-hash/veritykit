import type { Dataset } from "../data/dataset.js";
import { batches } from "../data/dataset.js";
import type { Method, Metrics, TrainableModel } from "../types.js";
import type { Tensor } from "../tensor/tensor.js";
import { Adam, type AdamConfig } from "./optim.js";

export type TrainerConfig = {
  model: TrainableModel;
  method: Method;
  optimizer?: Adam | AdamConfig;
  epochs?: number;
  batchSize?: number;
  maxGradNorm?: number;
  onStep?: (info: { epoch: number; step: number; loss: number; metrics: Metrics }) => void;
};

export type TrainResult = {
  losses: number[];
  last: Metrics;
};

export function createTrainer(config: TrainerConfig) {
  const optimizer =
    config.optimizer instanceof Adam ? config.optimizer : new Adam(config.optimizer ?? {});
  const epochs = config.epochs ?? 8;
  const batchSize = config.batchSize ?? 4;

  return {
    async fit(data: Dataset): Promise<TrainResult> {
      const losses: number[] = [];
      let last: Metrics = {};
      let step = 0;
      for (let epoch = 0; epoch < epochs; epoch++) {
        for (const batch of batches(data, batchSize)) {
          config.model.zeroGrad();
          const result = await config.method.step(batch, { model: config.model, optimizer });
          if (config.maxGradNorm) clipGrad(config.model.parameters(), config.maxGradNorm);
          optimizer.step(config.model.parameters());
          losses.push(result.loss);
          last = result.metrics;
          step += 1;
          config.onStep?.({ epoch, step, loss: result.loss, metrics: result.metrics });
        }
      }
      return { losses, last };
    },
  };
}

function clipGrad(params: Tensor[], maxNorm: number): void {
  let sumsq = 0;
  for (const p of params) {
    if (!p.grad) continue;
    for (let i = 0; i < p.size; i++) sumsq += p.grad[i]! ** 2;
  }
  const norm = Math.sqrt(sumsq);
  if (norm === 0 || norm <= maxNorm) return;
  const scale = maxNorm / norm;
  for (const p of params) {
    if (!p.grad) continue;
    for (let i = 0; i < p.size; i++) p.grad[i]! *= scale;
  }
}
