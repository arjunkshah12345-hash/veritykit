# Reward

Aesthetic RL is a reward-design problem. The program can be checked. Taste cannot. Author the few signals that actually move the model.

1. **Gate first.** If it did not run, or it did not use the API, the score is 0. Do not let length or style pay for a crash.
2. **Do not stack correlated judges.** Five “is this pretty?” scores are one score five times. The gradient dies.
3. **Prefer pairwise.** A 0–10 judge compresses. “Which of these two is the better sunset?” does not.
4. **Short allowlist.** A long API dump in the prompt makes models invent methods.

```ts
import { CANVAS_API, combine, gate, pairwise, ran, score, uses } from "veritykit";

const compile = score(gate(ran()), gate(uses(CANVAS_API)));

const taste = pairwise({
  references: loveTier,
  n: 2,
  compare: ({ candidate, against }) => Number(prefer(candidate, against)),
});

const verifier = combine({ verifier: compile, gate: true }, { verifier: taste, weight: 1 });
```

`paintEnvironment()` ships the compile gates plus coverage and color. Prompts include `canvasPrompt()` — the allowlist, not an API dump. `paintPool()` is the working programs. `pairwise` samples `n` references from the pool.
