# Paint with JavaScript

The picture is subjective. The program is not. Execute it, measure coverage and color, then train.

```ts
import { createTrainer, execute, metric, paintCorpus, ran, reinforce, score, sft } from "veritykit";

await createTrainer({ model, method: sft() }).fit(paintCorpus());

await createTrainer({
  model,
  method: reinforce({
    bridge: execute({ runtime: "canvas", size: 64 }),
    verifier: score(ran(2), metric("coverage"), metric("colorDiversity")),
  }),
}).fit(paintCorpus().map(({ prompt }) => ({ prompt })));
```

| Metric | Meaning |
|---|---|
| `ran` | The program executed without throwing |
| `coverage` | Share of pixels that are not the blank background |
| `colorDiversity` | How many distinct quantized colors showed up |
| `ink` | Non-white mass. Zero ink means the canvas stayed empty. |

The bundled runner uses `node:vm` plus a software canvas. Isolation for a training loop, not a production security sandbox.

```bash
pnpm example:paint
```
