# Verity

TypeScript training framework. One mission: train models on any data, including data you cannot verify.

## Conventions

- Named exports only. No default exports.
- Public functions are verbs (`createModel`, `createTrainer`, `environment`, `execute`).
- A **bridge** turns an output into a `Witness`. A **method** turns a batch into a loss and backwards. The trainer steps.
- Do not add trainer backends (TRL, veRL) into core. Export trajectories instead.
- Do not add provider SDKs. `httpPolicy` is fetch + an OpenAI-compatible URL.
- Keep the autograd surface small. If an op is not used by GPT or a method, do not add it.
- Tests live in `test/`. Run `pnpm test` and `pnpm typecheck` after changes.

## Layout

```
src/tensor    autograd
src/nn        GPT and layers
src/bridges   unverifiable → witness
src/train     SFT, DPO, GRPO, JEPO, process, mix
src/env       environments
```
