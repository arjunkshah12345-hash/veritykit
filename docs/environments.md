# Environments

An environment is a dataset plus a bridge plus a verifier.

```ts
import { httpPolicy, paintEnvironment, rollout } from "veritykit";

const env = paintEnvironment();
const groups = await rollout(env, httpPolicy({ model: "openai/gpt-4.1-mini" }));
```

`httpPolicy` is OpenAI-compatible. It does not backprop. Export the groups (advantage already computed) into TRL, veRL, or ART.

```ts
import { mockPolicy, paintEnvironment, rollout } from "veritykit";

await rollout(
  paintEnvironment(),
  mockPolicy(() => "ctx.fillStyle='gold';ctx.fillRect(0,0,64,64);"),
);
```

Build your own with `environment({ name, tasks, bridge, verifier })`.
