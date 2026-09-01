# API

Conservative surface. Named exports only.

| Export | Signature |
|---|---|
| `createModel` | `createModel(tokenizer \| text, { dim, layers, heads, context, seed })` |
| `createTrainer` | `createTrainer({ model, method, epochs, batchSize, optimizer, maxGradNorm, onStep })` |
| `environment` | `environment({ name, tasks, bridge, verifier })` |
| `rollout` | `rollout(env, policy, { generations, temperature })` |
| `execute` | `execute({ runtime: 'canvas' \| 'javascript', size, timeout })` |
| `match` | `match({ mode: 'exact' \| 'numeric' \| 'contains' })` |
| `process` | `process({ steps })` |
| `judge` | `judge({ rubric, score })` |
| `latent` / `jepo` | `latent()` · `jepo({ samples, maxTokens })` |
| `reformulate` | `reformulate({ compare }).rank(texts)` |
| `score` | `score(gate(ran()), gate(uses(re)), metric('coverage'), …)` |
| `gate` / `uses` | Hard compile / allowlist checks |
| `pairwise` | Win-rate against `n` sampled references (`seed` optional) |
| `canvasPrompt` | Task plus the canvas allowlist |
| `paintPool` | Working programs from `paintCorpus` |
| `combine` | Mix verifiers. `gate: true` zeros the rest |
| `httpPolicy` | `httpPolicy({ model, apiKey, baseURL })` |
| `mockPolicy` | `mockPolicy((prompt, i) => text)` |
| `exportGroups` | `exportGroups(groups)` → JSONL |

Types: `Task`, `Witness`, `Bridge`, `Method`, `Policy`, `Episode`, `Group`.
