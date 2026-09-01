# Verity

Train language models in TypeScript.

SFT, DPO, and GRPO. One trainer. No runtime dependencies. MIT.

**Site:** [verity.arjunshah.xyz](https://verity.arjunshah.xyz)

[![ci](https://github.com/arjunkshah12345-hash/veritykit/actions/workflows/ci.yml/badge.svg)](https://github.com/arjunkshah12345-hash/veritykit/actions/workflows/ci.yml)

```ts
import { CharTokenizer, createModel, createTrainer, dataset, sft } from "veritykit";

const text = `the sea is calm tonight
the tide is full the moon lies fair`;

const model = createModel(CharTokenizer.fromText(text), {
  dim: 32,
  layers: 2,
  heads: 4,
  context: 48,
});

await createTrainer({ model, method: sft(), epochs: 40 }).fit(
  dataset([{ prompt: "", target: text }]),
);

console.log(model.sample("the sea", { maxTokens: 60 }));
```

## Install

```bash
pnpm add veritykit
```

Node 18+. Local GPT in the package. For a hosted model, roll out groups and hand them to your trainer.

## Train

Supervised:

```ts
await createTrainer({ model, method: sft() }).fit(labeled);
```

Preference:

```ts
await createTrainer({ model, method: prefer() }).fit(pairs);
```

Reinforcement. Run the completion, score what happened, update:

```ts
await createTrainer({
  model,
  method: reinforce({
    bridge: execute({ runtime: "javascript" }),
    verifier: score(ok()),
  }),
}).fit(tasks);
```

`mix(sft(), prefer(), reinforce(...))` takes one optimizer step.

## Methods

| | Input | Loss |
|---|---|---|
| `sft()` | `target` or `completion` | Next-token. Pads ignored. |
| `prefer()` | `chosen` / `rejected` | DPO, implicit reference |
| `reinforce({ bridge })` | A scoreable run | GRPO |
| `jepo()` | Open-ended text | Jensen bound. No verifier. |
| `processMethod({ steps })` | Regex or function checks | Token loss × rules |
| `mix(...parts)` | Any of the above | One step. Weighted grads. |

Painting in JavaScript is the worked RL case: compile, allowlist, then pairwise against a pool. Not a stack of aesthetic judges.

## Examples

```bash
pnpm test
pnpm example:lm       # SFT a tiny character LM
pnpm example:paint    # SFT, then GRPO on canvas JS
pnpm example:open     # SFT + JEPO + process on proofs
pnpm example:eval     # rollout + exportGroups, no API key
```

The JS runner uses `node:vm`. Isolation for a training loop, not a security sandbox.

## Docs

[`docs/`](./docs/README.md) · `pnpm site`

## License

MIT
