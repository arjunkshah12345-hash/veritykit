# Install

```bash
pnpm add veritykit
```

Node 18+. No runtime dependencies.

```bash
pnpm install
pnpm test
pnpm example:lm
pnpm example:paint
pnpm example:open
```

| Path | When |
|---|---|
| `createTrainer` | Update the local GPT. Prove a method. |
| `environment` + `httpPolicy` | Roll out a hosted model. Collect witnesses and advantages. |

The JS runner uses `node:vm`. Isolation for a training loop, not a security sandbox.
