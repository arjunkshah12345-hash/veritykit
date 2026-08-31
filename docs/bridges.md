# Bridges

A bridge turns a completion into a witness. The verifier then reads metrics off that witness and returns a number in `[0, 1]`.

| Bridge | Use when | What becomes true |
|---|---|---|
| `execute` | The model emits code, SVG, JS, a sim | It ran. Metrics exist. |
| `match` | There is a gold short answer | Classic RLVR |
| `process` | Structure is checkable even if the answer is not | Step rules fired |
| `reformulate` | Open-ended, no gold | N samples become a ranking |
| `judge` | You accept a model critic | A contracted score |
| `latent` / `jepo` | Nothing is checkable | Thought is `z`, last span is `y` |

## Compose

```ts
import { compose, execute, judge } from "veritykit";

const bridge = compose([
  { bridge: execute({ runtime: "canvas" }), weight: 0.6 },
  { bridge: judge({ rubric: "Does this look like a sunset?", score }), weight: 0.4 },
]);
```

## Research this maps to

- RLVR — `match`, `execute`
- VPRM — `process`
- VMR-RLVR — `reformulate`
- RULER / RLAIF — `judge`
- JEPO (NeurIPS 2025, [arXiv:2503.19618](https://arxiv.org/abs/2503.19618)) — `latent` / `jepo`
