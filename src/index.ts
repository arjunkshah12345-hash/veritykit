export { Tensor, crossEntropy, gatheredLogprobs } from "./tensor/tensor.js";
export { rng } from "./tensor/util.js";
export { VerityError } from "./errors.js";

export { Module } from "./nn/module.js";
export { Linear } from "./nn/linear.js";
export { LayerNorm } from "./nn/norm.js";
export { Embedding } from "./nn/embedding.js";
export { GPT, createModel } from "./nn/gpt.js";
export { CharTokenizer, BOS, EOS, PAD } from "./nn/tokenizer.js";

export { dataset, batches, mixData, chunkText } from "./data/dataset.js";
export type { Dataset } from "./data/dataset.js";

export { execute, match, process, judge, latent, reformulate, compose } from "./bridges/index.js";
export { score, ran, metric, ok, verify, defaultVerifier } from "./verify/score.js";
export { extractCode, splitThought } from "./runtime/extract.js";
export { runJavascript } from "./runtime/javascript.js";
export { SoftwareCanvas } from "./runtime/canvas.js";

export { environment, rollout } from "./env/environment.js";
export { paintEnvironment, paintCorpus, proofCorpus, processSketch } from "./env/presets.js";

export { createTrainer } from "./train/trainer.js";
export { Adam } from "./train/optim.js";
export { sft } from "./train/sft.js";
export { prefer } from "./train/dpo.js";
export { reinforce } from "./train/grpo.js";
export { latentMethod, latentMethod as jepo } from "./train/jepo.js";
export { processMethod } from "./train/process.js";
export { mix } from "./train/mix.js";
export { advantages, groupByTask } from "./train/advantage.js";

export { httpPolicy, mockPolicy } from "./policies/http.js";

export type {
  Bridge,
  BridgeKind,
  Completion,
  Episode,
  Example,
  Group,
  Method,
  Metrics,
  Policy,
  Task,
  TrainableModel,
  Verifier,
  Witness,
} from "./types.js";
