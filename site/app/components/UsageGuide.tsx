import Link from "next/link";
import { GITHUB } from "../lib/links";
import { CopyBlock } from "./CopyBlock";

const INSTALL = "pnpm add veritykit";
const AGENT = "Install veritykit. SFT a tiny character LM with createModel, createTrainer, and sft(). Print loss. No API key.";

const SETUP = `import { CharTokenizer, createModel, createTrainer, dataset, sft } from 'veritykit'

const text = \`the sea is calm tonight
the tide is full the moon lies fair\`

const model = createModel(CharTokenizer.fromText(text), {
  dim: 32,
  layers: 2,
  heads: 4,
  context: 48,
})

await createTrainer({ model, method: sft(), epochs: 40 }).fit(
  dataset([{ prompt: '', target: text }]),
)

console.log(model.sample('the sea', { maxTokens: 60 }))`;

const RL = `import { execute, ok, reinforce, score } from 'veritykit'

await createTrainer({
  model,
  method: reinforce({
    bridge: execute({ runtime: 'javascript' }),
    verifier: score(ok()),
  }),
}).fit(tasks)`;

const HOSTED = `import { exportGroups, httpPolicy, paintEnvironment, rollout } from 'veritykit'

const groups = await rollout(
  paintEnvironment(),
  httpPolicy({ model: 'openai/gpt-4.1-mini' }),
)
console.log(exportGroups(groups))`;

const PROMPTS = [
  {
    title: "Supervised fine-tune a tiny model.",
    text: "Use createModel and createTrainer with sft() on a short labeled dataset. Print loss each step. No API key.",
  },
  {
    title: "Add preference training.",
    text: "Fit prefer() on rows with chosen and rejected completions. Keep the same model and trainer.",
  },
  {
    title: "Score generated code.",
    text: "Use reinforce() with execute({ runtime: 'javascript' }). Reward 1 if the program runs.",
  },
  {
    title: "Evaluate a hosted model.",
    text: "Build an environment with tasks and a verifier. Roll it out with httpPolicy. Print mean reward. Do not backprop.",
  },
];

export function UsageGuide() {
  return (
    <section className="usage-guide" data-theme="dark" aria-label="Verity setup guide">
      <div className="usage-content">
        <section className="usage-section" id="install" aria-labelledby="installation-title">
          <div className="usage-heading-row">
            <h2 id="installation-title">Install</h2>
            <a className="usage-github-link" href={GITHUB} aria-label="GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.36 6.84 9.72.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.9-1.32 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.58 5.06.36.32.68.94.68 1.9 0 1.38-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.05 10.05 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
              </svg>
            </a>
          </div>
          <p>Open-source TypeScript training. Node 18+. No runtime dependencies.</p>
          <CopyBlock code={INSTALL}>
            <span className="usage-syntax usage-syntax--keyword">pnpm add</span>
            <span> veritykit</span>
          </CopyBlock>
          <p>Or tell an agent.</p>
          <CopyBlock code={AGENT}>{AGENT}</CopyBlock>
        </section>

        <section className="usage-section" id="example" aria-labelledby="example-title">
          <h2 id="example-title">Train a tiny model</h2>
          <p>Same script as <code>pnpm example:lm</code>. Loss should fall. Then sample.</p>
          <CopyBlock code={SETUP}>
            <span className="usage-syntax usage-syntax--keyword">import</span>
            {" { CharTokenizer, createModel, createTrainer, dataset, sft } "}
            <span className="usage-syntax usage-syntax--keyword">from</span>{" "}
            <span className="usage-syntax usage-syntax--string">&apos;veritykit&apos;</span>
            {"\n\n"}
            <span className="usage-syntax usage-syntax--keyword">const</span>
            {" text = `the sea is calm tonight\nthe tide is full the moon lies fair`\n\n"}
            <span className="usage-syntax usage-syntax--keyword">const</span>
            {" model = createModel(CharTokenizer.fromText(text), "}
            <span className="usage-syntax usage-syntax--brace">{"{"}</span>
            {"\n  dim: 32,\n  layers: 2,\n  heads: 4,\n  context: 48,\n"}
            <span className="usage-syntax usage-syntax--brace">{"}"}</span>
            {")\n\n"}
            {"await createTrainer("}
            <span className="usage-syntax usage-syntax--brace">{"{"}</span>
            {" model, method: sft(), epochs: 40 "}
            <span className="usage-syntax usage-syntax--brace">{"}"}</span>
            {").fit(\n  dataset(["}
            <span className="usage-syntax usage-syntax--brace">{"{"}</span>
            {" prompt: '', target: text "}
            <span className="usage-syntax usage-syntax--brace">{"}"}</span>
            {"]),\n)\n\nconsole.log(model.sample('the sea', "}
            <span className="usage-syntax usage-syntax--brace">{"{"}</span>
            {" maxTokens: 60 "}
            <span className="usage-syntax usage-syntax--brace">{"}"}</span>
            {")"}
          </CopyBlock>
        </section>

        <section className="usage-section" id="score" aria-labelledby="score-title">
          <h2 id="score-title">Then score a run</h2>
          <p>Execute the completion. Reward 1 if it ran. Same trainer.</p>
          <CopyBlock code={RL}>
            <span className="usage-syntax usage-syntax--keyword">import</span>
            {" { execute, ok, reinforce, score } "}
            <span className="usage-syntax usage-syntax--keyword">from</span>{" "}
            <span className="usage-syntax usage-syntax--string">&apos;veritykit&apos;</span>
            {"\n\nawait createTrainer(\n  "}
            <span className="usage-syntax usage-syntax--brace">{"{"}</span>
            {"\n    model,\n    method: reinforce(\n      "}
            <span className="usage-syntax usage-syntax--brace">{"{"}</span>
            {"\n        bridge: execute("}
            <span className="usage-syntax usage-syntax--brace">{"{"}</span>
            {" runtime: 'javascript' "}
            <span className="usage-syntax usage-syntax--brace">{"}"}</span>
            {"),\n        verifier: score(ok()),\n      "}
            <span className="usage-syntax usage-syntax--brace">{"}"}</span>
            {"),\n  "}
            <span className="usage-syntax usage-syntax--brace">{"}"}</span>
            {",\n).fit(tasks)"}
          </CopyBlock>
        </section>

        <section className="usage-section" id="hosted" aria-labelledby="hosted-title">
          <h2 id="hosted-title">Or evaluate a hosted model</h2>
          <p>No backprop. Advantage is already on the groups.</p>
          <CopyBlock code={HOSTED}>
            <span className="usage-syntax usage-syntax--keyword">import</span>
            {" { exportGroups, httpPolicy, paintEnvironment, rollout } "}
            <span className="usage-syntax usage-syntax--keyword">from</span>{" "}
            <span className="usage-syntax usage-syntax--string">&apos;veritykit&apos;</span>
            {"\n\n"}
            <span className="usage-syntax usage-syntax--keyword">const</span>
            {" groups = await rollout(\n  paintEnvironment(),\n  httpPolicy("}
            <span className="usage-syntax usage-syntax--brace">{"{"}</span>
            {" model: 'openai/gpt-4.1-mini' "}
            <span className="usage-syntax usage-syntax--brace">{"}"}</span>
            {"),\n)\nconsole.log(exportGroups(groups))"}
          </CopyBlock>
        </section>

        <section className="usage-section" id="prompts" aria-labelledby="prompts-title">
          <h2 id="prompts-title">Prompts</h2>
          <p>Paste one into an agent.</p>
          <div className="usage-prompt-list">
            {PROMPTS.map((prompt) => (
              <article className="usage-prompt" key={prompt.title}>
                <h3>{prompt.title}</h3>
                <CopyBlock code={prompt.text}>{prompt.text}</CopyBlock>
              </article>
            ))}
          </div>
        </section>

        <footer className="usage-footer">
          <p>
            MIT. <Link href="/docs">Docs</Link>. <a href={GITHUB}>GitHub</a>.{" "}
            <code>pnpm example:lm</code>
          </p>
        </footer>
      </div>
    </section>
  );
}
