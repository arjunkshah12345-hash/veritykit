import {
  CharTokenizer,
  createModel,
  createTrainer,
  execute,
  metric,
  paintCorpus,
  ran,
  reinforce,
  score,
  sft,
} from "../src/index.js";

const corpus = paintCorpus();
const vocabSource = corpus.map((r) => `${r.prompt}\n${r.target}`).join("\n");
const model = createModel(CharTokenizer.fromText(vocabSource), {
  dim: 48,
  layers: 2,
  heads: 4,
  context: 160,
  seed: 11,
});

console.log("1. SFT on verified canvas programs");
await createTrainer({
  model,
  method: sft(),
  epochs: 20,
  batchSize: 1,
  optimizer: { lr: 4e-3, weightDecay: 0 },
  onStep: ({ step, loss }) => {
    if (step % 10 === 0) console.log(`  sft ${step}  ${loss.toFixed(3)}`);
  },
}).fit(corpus);

console.log("2. GRPO — execute the JS, score the pixels");
await createTrainer({
  model,
  method: reinforce({
    bridge: execute({ runtime: "canvas", size: 48 }),
    verifier: score(ran(2), metric("coverage"), metric("colorDiversity"), metric("ink")),
    generations: 3,
    maxTokens: 120,
  }),
  epochs: 2,
  batchSize: 1,
  optimizer: { lr: 1e-3, weightDecay: 0 },
  onStep: ({ step, metrics }) => {
    console.log(`  rl ${step}  reward ${(metrics.reward ?? 0).toFixed(3)}`);
  },
}).fit(corpus.map(({ prompt }) => ({ prompt })));

const sample = model.sample(corpus[0]!.prompt, { maxTokens: 140, temperature: 0.4, seed: 2 });
console.log("sample:\n" + sample);
