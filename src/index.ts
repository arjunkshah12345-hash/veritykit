export { VerityError } from "./errors.js";

export { GPT, createModel } from "./nn/gpt.js";
export { CharTokenizer } from "./nn/tokenizer.js";

export { dataset, batches, mixData, chunkText } from "./data/dataset.js";
export type { Dataset } from "./data/dataset.js";

export { execute, match, process, judge, latent, reformulate, compose } from "./bridges/index.js";
export { score, ran, metric, ok, gate, uses, pairwise, combine, verify, defaultVerifier } from "./verify/score.js";
export { extractCode, splitThought } from "./runtime/extract.js";

export { environment, rollout } from "./env/environment.js";
export { exportGroups } from "./env/export.js";
export { CANVAS_API, paintEnvironment, paintCorpus, proofCorpus, processSketch } from "./env/presets.js";

export { createTrainer } from "./train/trainer.js";
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
