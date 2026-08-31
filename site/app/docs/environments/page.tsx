import type { Metadata } from "next";
import { CopyBlock } from "../../components/CopyBlock";

export const metadata: Metadata = {
  title: "Environments",
  description: "Roll out a hosted model and collect advantages.",
};

const EVAL = `import { httpPolicy, paintEnvironment, rollout } from 'veritykit'

const env = paintEnvironment()
const groups = await rollout(env, httpPolicy({ model: 'openai/gpt-4.1-mini' }))

for (const group of groups) {
  for (const episode of group.episodes) {
    console.log(episode.reward, episode.advantage, episode.completion.text)
  }
}`;

const LOCAL = `import { mockPolicy, paintEnvironment, rollout } from 'veritykit'

const groups = await rollout(
  paintEnvironment(),
  mockPolicy(() => "ctx.fillStyle='gold';ctx.fillRect(0,0,64,64);"),
)`;

export default function EnvironmentsDocs() {
  return (
    <article>
      <h2>Environments</h2>
      <p>
        An environment is a dataset plus a bridge plus a verifier. Use the same object to train the
        local GPT or to evaluate a hosted policy.
      </p>
      <CopyBlock code={EVAL}>{EVAL}</CopyBlock>
      <p>
        <code>httpPolicy</code> is OpenAI-compatible. It does not backprop.{" "}
        <code>exportGroups(groups)</code> writes JSONL. Advantage is already computed.
      </p>

      <h3>No API key</h3>
      <p>
        <code>mockPolicy</code> is for tests and for proving the environment before you spend tokens.
      </p>
      <CopyBlock code={LOCAL}>{LOCAL}</CopyBlock>

      <h3>Build your own</h3>
      <p>
        <code>environment({"{ name, tasks, bridge, verifier }"})</code>. Tasks need a{" "}
        <code>prompt</code>. Add <code>answer</code> only when <code>match</code> can use it.
      </p>
    </article>
  );
}
