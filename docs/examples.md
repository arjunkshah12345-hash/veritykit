# Examples

```bash
pnpm example:lm
pnpm example:paint
pnpm example:open
pnpm example:eval
```

| Script | What it proves |
|---|---|
| `examples/char-lm.ts` | SFT a tiny character LM. Loss should collapse. |
| `examples/paint-js.ts` | SFT on canvas programs, then GRPO against the executor. |
| `examples/unverifiable.ts` | Mix SFT, JEPO, and process checks on proofs with no short gold answer. |
| `examples/eval-paint.ts` | Roll out the paint env with a mock policy. Print JSONL groups. |

Expected local trainer: SFT loss on the character LM goes from about 5.5 toward 0. The unverifiable mix should drop the Jensen term. Those numbers are laptop-scale, not a benchmark claim.
