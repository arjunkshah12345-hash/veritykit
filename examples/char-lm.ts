import { CharTokenizer, createModel, createTrainer, dataset, sft } from "../src/index.js";

const poem = `the sea is calm tonight
the tide is full the moon lies fair
on the french coast the light gleams
come to the window sweet is the night air
`;

const model = createModel(CharTokenizer.fromText(poem), {
  dim: 32,
  layers: 2,
  heads: 4,
  context: 48,
  seed: 7,
});

const data = dataset([{ prompt: "", target: poem }]);
const trainer = createTrainer({
  model,
  method: sft(),
  epochs: 40,
  batchSize: 1,
  optimizer: { lr: 6e-3, weightDecay: 0 },
  onStep: ({ step, loss }) => {
    if (step % 10 === 0) console.log(`step ${step}  loss ${loss.toFixed(4)}`);
  },
});

const { losses } = await trainer.fit(data);
console.log("first", losses[0]?.toFixed(4), "last", losses[losses.length - 1]?.toFixed(4));
console.log("sample:\n" + model.sample("the sea", { maxTokens: 60, temperature: 0.7, seed: 1 }));
