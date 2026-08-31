# Paint with JavaScript

The picture is subjective. The program is not. Execute it. Gate on “it ran” and “it used the API.” Then score what you can measure. For taste, use pairwise against a pool — not five aesthetic judges.

```ts
import { CANVAS_API, createTrainer, execute, gate, metric, paintCorpus, ran, reinforce, score, sft, uses } from "veritykit";

await createTrainer({ model, method: sft() }).fit(paintCorpus());

await createTrainer({
  model,
  method: reinforce({
    bridge: execute({ runtime: "canvas", size: 64 }),
    verifier: score(gate(ran()), gate(uses(CANVAS_API)), metric("coverage"), metric("colorDiversity")),
  }),
}).fit(paintCorpus().map(({ prompt }) => ({ prompt })));
```

| Metric | Meaning |
|---|---|
| `ran` | The program executed without throwing |
| `uses` | The completion touched the allowlist |
| `coverage` | Non-blank pixels |
| `colorDiversity` | Distinct quantized colors |

See [Reward](./reward.md). `pnpm example:paint`.
