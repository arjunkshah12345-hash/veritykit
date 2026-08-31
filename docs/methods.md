# Methods

A method turns a batch into a loss. `mix()` accumulates gradients. The trainer steps once.

| Method | Needs | Loss |
|---|---|---|
| `sft()` | `target` or `completion` | Next-token. Pads ignored. |
| `prefer()` | `chosen` / `rejected` | `-log σ(β Δ logπ)`. Implicit reference. |
| `reinforce({ bridge })` | A scoreable witness | GRPO advantages, then a policy gradient |
| `jepo()` | Open-ended text. No verifier. | Multi-sample Jensen bound. Thought is latent. |
| `processMethod({ steps })` | Regex or function checks | Token loss weighted by which rules fired |
| `mix(...parts)` | Any of the above | Weighted combination, one optimizer step |

```ts
await createTrainer({
  model,
  method: mix(
    { method: sft(), weight: 0.3 },
    { method: jepo(), weight: 0.4 },
    { method: processMethod({ steps: [{ name: "plan", test: /step 1/i }] }), weight: 0.3 },
  ),
}).fit(everything);
```

GRPO advantages are zero-mean within a prompt group. If every sample in a group gets the same reward, the step is a no-op.
