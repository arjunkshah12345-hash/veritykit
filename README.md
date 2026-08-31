# Verity

[![ci](https://github.com/arjunkshah12345-hash/veritykit/actions/workflows/ci.yml/badge.svg)](https://github.com/arjunkshah12345-hash/veritykit/actions/workflows/ci.yml)

Make the unverifiable trainable.

<p align="center">
  <img src="brand/banner.jpg" alt="Verity" width="720" />
</p>

```ts
import { createModel, createTrainer, execute, reinforce, sft } from "veritykit";

const model = createModel(code, { dim: 64, layers: 2, heads: 4 });

await createTrainer({ model, method: sft() }).fit(labeled);

await createTrainer({
  model,
  method: reinforce({ bridge: execute({ runtime: "canvas" }) }),
}).fit(paintTasks);
```

A completion is not a label. A **witness** is. Run the program, check the steps, rank the samples, or treat the thought as latent. Then train.

```
task → model → completion → bridge → witness → method → update
```

## Install

```bash
pnpm add veritykit
```

Node 18+. No runtime dependencies.

## Bridges

| | When | Witness |
|---|---|---|
| `execute` | The model emits code | It ran. Metrics exist. |
| `match` | There is a gold short answer | Classic RLVR |
| `process` | Structure is checkable | Step rules fired |
| `reformulate` | Open-ended, no gold | N samples become a ranking |
| `judge` | You accept a critic | A contracted score |
| `latent` / `jepo` | Nothing is checkable | Thought is z. Last span is y. |

Painting in JavaScript is the headline case. The picture is subjective. The program is not. Gate on compile and the API. For taste, pairwise against a pool — not five aesthetic judges.

## Methods

| | Needs | Loss |
|---|---|---|
| `sft()` | `target` or `completion` | Next-token. Pads ignored. |
| `prefer()` | `chosen` / `rejected` | DPO, implicit reference |
| `reinforce({ bridge })` | A scoreable witness | GRPO |
| `jepo()` | Open-ended text | Jensen bound. No verifier. |
| `processMethod({ steps })` | Regex or function checks | Token loss × rules |
| `mix(...parts)` | Any of the above | One step. Weighted grads. |

`createTrainer` updates the local GPT. For a hosted model, `environment` + `httpPolicy`, then `exportGroups()` — advantage already computed.

## Examples

```bash
pnpm test
pnpm example:lm       # SFT a tiny language model
pnpm example:paint    # SFT, then GRPO on canvas JS
pnpm example:open     # SFT + JEPO + process on proofs
```

The JS runner uses `node:vm`. Isolation for a training loop, not a security sandbox.

## Docs

[`docs/`](./docs/README.md) · `pnpm site`

## License

MIT
