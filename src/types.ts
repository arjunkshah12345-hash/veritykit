import type { Tensor } from "./tensor/tensor.js";

/** How a task becomes something a trainer can score. */
export type BridgeKind =
  | "execute"
  | "match"
  | "process"
  | "judge"
  | "latent"
  | "reformulate"
  | "compose";

/** Evidence that an output happened and can be scored. */
export type Witness = {
  ok: boolean;
  kind: BridgeKind;
  artifact?: unknown;
  metrics: Record<string, number>;
  logs: string[];
  error?: string;
};

export type Task = {
  id?: string;
  prompt: string;
  /** Optional target — present for SFT / classic RLVR. */
  target?: string;
  /** Optional gold answer for match bridges. */
  answer?: string;
  info?: Record<string, unknown>;
};

export type Example = Task & {
  /** Preferred completion for DPO. */
  chosen?: string;
  /** Rejected completion for DPO. */
  rejected?: string;
  /** Freeform completion, used by SFT when `target` is absent. */
  completion?: string;
};

export type Completion = {
  text: string;
  logprob?: number;
};

export type Episode = {
  task: Task;
  completion: Completion;
  witness: Witness;
  reward: number;
};

export type Group = {
  task: Task;
  episodes: Array<Episode & { advantage: number }>;
};

export type Metrics = Record<string, number>;

export type StepResult = {
  loss: number;
  metrics: Metrics;
};

export type Policy = {
  generate(input: { prompt: string; n?: number; temperature?: number; seed?: number }): Promise<Completion[]>;
};

export type Bridge = {
  readonly kind: BridgeKind;
  run(input: { task: Task; completion: string }): Promise<Witness> | Witness;
};

export type Verifier = {
  score(input: { task: Task; completion: string; witness: Witness }): number;
};

export type MethodName = "sft" | "dpo" | "grpo" | "jepo" | "process" | "mix";

export type Method = {
  readonly name: MethodName;
  step(batch: Example[], ctx: MethodContext): StepResult | Promise<StepResult>;
};

export type MethodContext = {
  model: TrainableModel;
  optimizer: { step: (params: Tensor[]) => void };
  /** Multiply the loss before backward. Used by `mix()`. */
  scale?: number;
};

export type TrainableModel = {
  tokenizer: { encode: (text: string, opts?: { addBos?: boolean; addEos?: boolean; maxLength?: number }) => number[]; padBatch: (rows: number[][], length: number) => number[][] };
  config: { context: number };
  loss: (ids: number[][]) => Tensor;
  logprobs: (ids: number[][]) => Tensor;
  sample: (prompt: string, opts?: { maxTokens?: number; temperature?: number; seed?: number }) => string;
  parameters: () => Tensor[];
  zeroGrad: () => void;
};
