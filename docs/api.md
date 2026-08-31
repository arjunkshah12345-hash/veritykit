# API

Conservative surface. Named exports only.

| Export | Signature |
|---|---|
| `createModel` | `createModel(tokenizer \| text, { dim, layers, heads, context, seed })` |
| `createTrainer` | `createTrainer({ model, method, epochs, batchSize, optimizer, onStep })` |
| `environment` | `environment({ name, tasks, bridge, verifier })` |
| `rollout` | `rollout(env, policy, { generations, temperature })` |
| `execute` | `execute({ runtime: 'canvas' \| 'javascript', size, timeout })` |
| `match` | `match({ mode: 'exact' \| 'numeric' \| 'contains' })` |
| `process` | `process({ steps })` |
| `judge` | `judge({ rubric, score })` |
| `latent` / `jepo` | `latent()` · `jepo({ samples, maxTokens })` |
| `reformulate` | `reformulate({ compare }).rank(texts)` |
| `score` | `score(ran(), metric('coverage'), …)` |
| `httpPolicy` | `httpPolicy({ model, apiKey, baseURL })` |
| `mockPolicy` | `mockPolicy((prompt, i) => text)` |
| `exportGroups` | `exportGroups(groups)` → JSONL |

Types: `Task`, `Witness`, `Bridge`, `Method`, `Policy`, `Episode`, `Group`.
