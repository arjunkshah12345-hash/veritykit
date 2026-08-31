import {
  CharTokenizer,
  createModel,
  createTrainer,
  dataset,
  latentMethod,
  mix,
  processMethod,
  proofCorpus,
  sft,
} from "../src/index.js";

const proofs = proofCorpus();
const extra = dataset([
  {
    prompt: "Why is the product of two odd numbers odd? Write steps, then a final sentence.",
    completion:
      "Step 1: odd means 2a+1.\nStep 2: (2a+1)(2b+1)=4ab+2a+2b+1.\nFinal: one remains after grouping evens, so the product is odd.",
  },
]);
const data = [...proofs, ...extra];
const text = data.map((r) => `${r.prompt}\n${r.completion}`).join("\n");
const model = createModel(CharTokenizer.fromText(text), {
  dim: 32,
  layers: 2,
  heads: 4,
  context: 128,
  seed: 5,
});

console.log("Train on proofs that have no short gold answer");
await createTrainer({
  model,
  method: mix(
    { method: sft(), weight: 0.4 },
    { method: latentMethod({ samples: 2, maxTokens: 48 }), weight: 0.4 },
    {
      method: processMethod({
        steps: [
          { name: "has-step", test: /step\s*1/i },
          { name: "has-final", test: /final\s*:/i },
        ],
      }),
      weight: 0.2,
    },
  ),
  epochs: 6,
  batchSize: 1,
  optimizer: { lr: 4e-3, weightDecay: 0 },
  onStep: ({ step, loss, metrics }) => {
    if (step % 3 === 0) {
      console.log(`step ${step}  loss ${loss.toFixed(3)}  jensen ${metrics["jepo.jensen"]?.toFixed(3) ?? "-"}`);
    }
  },
}).fit(data);

console.log("sample:\n" + model.sample(data[0]!.prompt, { maxTokens: 80, temperature: 0.6, seed: 4 }));
