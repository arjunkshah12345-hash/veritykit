# Examples

```bash
pnpm example:lm
pnpm example:paint
pnpm example:open
```

| Script | What it proves |
|---|---|
| `examples/char-lm.ts` | SFT a tiny character LM. Loss should collapse. |
| `examples/paint-js.ts` | SFT on canvas programs, then GRPO against the executor. |
| `examples/unverifiable.ts` | Mix SFT, JEPO, and process checks on proofs with no short gold answer. |

Expected local trainer: SFT loss on the character LM goes from about 5.5 toward 0. The unverifiable mix should drop the Jensen term. Those numbers are laptop-scale, not a benchmark claim.
