# Verity launch tweets

Post **Tweet 1** as a new post. Pin it. Then reply in order if you run the thread.

Site: https://verity.arjunshah.xyz
Repo: https://github.com/arjunkshah12345-hash/veritykit

---

## Tweet 1 (primary)

```
I open-sourced Verity.

train language models in TypeScript.
SFT, DPO, GRPO. one trainer. MIT.

pnpm add veritykit

verity.arjunshah.xyz
```

---

## Tweet 1 alt (shorter)

```
Train language models in TypeScript.

SFT. DPO. GRPO. One trainer.

pnpm add veritykit
verity.arjunshah.xyz
```

---

## First reply (install + repo)

```
github.com/arjunkshah12345-hash/veritykit

local GPT with createTrainer.
hosted model: roll out groups, export them, train elsewhere.
```

---

## Thread (optional)

### 2

```
supervised:

await createTrainer({ model, method: sft() }).fit(labeled)

preference:

await createTrainer({ model, method: prefer() }).fit(pairs)
```

### 3

```
reinforcement:

await createTrainer({
  model,
  method: reinforce({
    bridge: execute({ runtime: 'javascript' }),
    verifier: score(ok()),
  }),
}).fit(tasks)

run the completion. score what happened. update.
```

### 4

```
no Python. no runtime deps. Node 18+.

what's the smallest model you'd actually fine-tune in JS?
```

---

## Notes

- No hashtags. No tag list on the parent.
- Prefer Tweet 1 primary. Alt if you want colder.
- Link the site, not only the repo. The lander is the product surface.
