import { crossEntropy, gatheredLogprobs, Tensor } from "../tensor/tensor.js";
import { rng } from "../tensor/util.js";
import { CausalSelfAttention } from "./attention.js";
import { Embedding } from "./embedding.js";
import { Linear } from "./linear.js";
import { collect, Module } from "./module.js";
import { LayerNorm } from "./norm.js";
import { CharTokenizer } from "./tokenizer.js";

export type GptConfig = {
  vocab: number;
  dim?: number;
  layers?: number;
  heads?: number;
  context?: number;
  seed?: number;
};

class Block extends Module {
  readonly ln1: LayerNorm;
  readonly attn: CausalSelfAttention;
  readonly ln2: LayerNorm;
  readonly fc: Linear;
  readonly proj: Linear;

  constructor(dim: number, heads: number, seed: number) {
    super();
    this.ln1 = new LayerNorm(dim);
    this.attn = new CausalSelfAttention(dim, heads, seed);
    this.ln2 = new LayerNorm(dim);
    this.fc = new Linear(dim, dim * 4, seed + 10);
    this.proj = new Linear(dim * 4, dim, seed + 11);
  }

  forward(x: Tensor): Tensor {
    const a = this.attn.forward(this.ln1.forward(x));
    const h = x.add(a);
    const m = this.proj.forward(this.fc.forward(this.ln2.forward(h)).gelu());
    return h.add(m);
  }

  parameters(): Tensor[] {
    return collect([this.ln1, this.attn, this.ln2, this.fc, this.proj]);
  }
}

export class GPT extends Module {
  readonly tokenizer: CharTokenizer;
  readonly config: Required<GptConfig>;
  readonly tok: Embedding;
  readonly pos: Embedding;
  readonly blocks: Block[];
  readonly ln: LayerNorm;
  readonly head: Linear;

  constructor(tokenizer: CharTokenizer, config: GptConfig) {
    super();
    this.tokenizer = tokenizer;
    this.config = {
      vocab: config.vocab,
      dim: config.dim ?? 64,
      layers: config.layers ?? 2,
      heads: config.heads ?? 4,
      context: config.context ?? 64,
      seed: config.seed ?? 1,
    };
    const { dim, layers, heads, context, seed, vocab } = this.config;
    this.tok = new Embedding(vocab, dim, seed);
    this.pos = new Embedding(context, dim, seed + 50);
    this.blocks = Array.from({ length: layers }, (_, i) => new Block(dim, heads, seed + 100 * (i + 1)));
    this.ln = new LayerNorm(dim);
    this.head = new Linear(dim, vocab, seed + 999);
  }

  embed(ids: number[][]): Tensor {
    const t = ids[0]?.length ?? 0;
    if (t > this.config.context) throw new Error(`sequence ${t} > context ${this.config.context}`);
    const pos = ids.map((row) => row.map((_, i) => i));
    return this.tok.forward(ids).add(this.pos.forward(pos));
  }

  logits(ids: number[][]): Tensor {
    let x = this.embed(ids);
    for (const block of this.blocks) x = block.forward(x);
    return this.head.forward(this.ln.forward(x));
  }

  loss(ids: number[][]): Tensor {
    const inputs = ids.map((row) => row.slice(0, -1));
    const targets = ids.flatMap((row) => row.slice(1));
    return crossEntropy(this.logits(inputs), targets, this.tokenizer.pad);
  }

  logprobs(ids: number[][]): Tensor {
    const inputs = ids.map((row) => row.slice(0, -1));
    const tokens = ids.map((row) => row.slice(1));
    return gatheredLogprobs(this.logits(inputs), tokens, this.tokenizer.pad);
  }

  sample(prompt: string, opts: { maxTokens?: number; temperature?: number; seed?: number } = {}): string {
    const maxTokens = opts.maxTokens ?? 48;
    const temperature = opts.temperature ?? 0.8;
    const rand = rng(opts.seed ?? Date.now());
    let ids = this.tokenizer.encode(prompt, { addBos: true });
    if (ids.length >= this.config.context) ids = ids.slice(-this.config.context + 1);

    for (let n = 0; n < maxTokens; n++) {
      const ctx = ids.slice(-this.config.context);
      const logits = this.logits([ctx]);
      const t = ctx.length - 1;
      const v = this.config.vocab;
      const off = t * v;
      const scored: number[] = [];
      let max = -Infinity;
      for (let j = 0; j < v; j++) {
        const s = logits.data[off + j]! / Math.max(temperature, 1e-6);
        scored.push(s);
        if (s > max) max = s;
      }
      let sum = 0;
      for (let j = 0; j < v; j++) {
        scored[j] = Math.exp(scored[j]! - max);
        sum += scored[j]!;
      }
      let r = rand() * sum;
      let pick = v - 1;
      for (let j = 0; j < v; j++) {
        r -= scored[j]!;
        if (r <= 0) {
          pick = j;
          break;
        }
      }
      if (pick === this.tokenizer.eos) break;
      ids.push(pick);
    }
    return this.tokenizer.decode(ids, { skipSpecial: true });
  }

  parameters(): Tensor[] {
    return collect([this.tok, this.pos, ...this.blocks, this.ln, this.head]);
  }
}

export function createModel(
  source: string | CharTokenizer,
  config: Omit<GptConfig, "vocab"> = {},
): GPT {
  const tokenizer = typeof source === "string" ? CharTokenizer.fromText(source) : source;
  return new GPT(tokenizer, { ...config, vocab: tokenizer.vocabSize });
}
