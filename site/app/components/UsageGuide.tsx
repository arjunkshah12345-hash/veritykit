import Link from "next/link";
import { GITHUB } from "../lib/links";
import { CopyBlock } from "./CopyBlock";
import { PaintDemo } from "./PaintDemo";

const INSTALL = "pnpm add veritykit";
const AGENT = "Install Verity in this repo and add a paint-js environment.";
const SETUP = `import { createModel, createTrainer, execute, reinforce, sft } from 'veritykit'

const model = createModel(code, { dim: 64, layers: 2, heads: 4 })

await createTrainer({ model, method: sft() }).fit(labeled)

await createTrainer({
  model,
  method: reinforce({ bridge: execute({ runtime: 'canvas' }) }),
}).fit(paintTasks)`;

const PROMPTS = [
  {
    title: "Train a model to paint with JavaScript.",
    text: "Use Verity to SFT a tiny GPT on canvas programs, then GRPO with execute({ runtime: 'canvas' }). Score ran, coverage, and colorDiversity. Keep the example runnable without an API key.",
  },
  {
    title: "Train on proofs that have no short answer.",
    text: "Add a Verity trainer that mixes sft(), jepo(), and processMethod() on long-form proofs. Split thought from the final sentence. Do not invent a gold answer.",
  },
  {
    title: "Turn an open-ended task into a ranking.",
    text: "Use reformulate() so N completions of the same prompt become a pairwise ranking. Export GRPO advantages as JSONL.",
  },
  {
    title: "Score a hosted model. Do not backprop through it.",
    text: "Create a paintEnvironment(), evaluate it with httpPolicy({ model: 'openai/gpt-4.1-mini' }), and print mean reward. Do not backprop through the HTTP policy.",
  },
];

export function UsageGuide() {
  return (
    <section className="usage-guide" data-theme="dark" aria-label="Verity setup guide">
      <div className="usage-content">
        <section className="usage-section" id="demo" aria-labelledby="demo-title">
          <h2 id="demo-title">Demo</h2>
          <p>JavaScript ran. Pixels exist. Those numbers are a reward.</p>
          <PaintDemo />
        </section>

        <section className="usage-section" id="installation" aria-labelledby="installation-title">
          <div className="usage-heading-row">
            <h2 id="installation-title">Install</h2>
            <a className="usage-github-link" href={GITHUB} aria-label="GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.36 6.84 9.72.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.9-1.32 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.58 5.06.36.32.68.94.68 1.9 0 1.38-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.05 10.05 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
              </svg>
            </a>
          </div>
          <p>Add the package.</p>
          <CopyBlock code={INSTALL}>
            <span className="usage-syntax usage-syntax--keyword">pnpm add</span>
            <span> veritykit</span>
          </CopyBlock>
          <p>Or tell an agent.</p>
          <CopyBlock code={AGENT}>{AGENT}</CopyBlock>
          <p>
            Local training is a model plus a method. <code>execute</code> turns JavaScript into
            pixels you can score.
          </p>
          <CopyBlock code={SETUP}>
            <span className="usage-syntax usage-syntax--keyword">import</span>
            {" { createModel, createTrainer, execute, reinforce, sft } "}
            <span className="usage-syntax usage-syntax--keyword">from</span>{" "}
            <span className="usage-syntax usage-syntax--string">&apos;veritykit&apos;</span>
            {"\n\n"}
            <span className="usage-syntax usage-syntax--keyword">const</span>
            {" model = createModel(code, "}
            <span className="usage-syntax usage-syntax--brace">{"{"}</span>
            {" dim: 64, layers: 2, heads: 4 "}
            <span className="usage-syntax usage-syntax--brace">{"}"}</span>
            {")\n\n"}
            {"await createTrainer("}
            <span className="usage-syntax usage-syntax--brace">{"{"}</span>
            {" model, method: sft() "}
            <span className="usage-syntax usage-syntax--brace">{"}"}</span>
            {").fit(labeled)\n\n"}
            {"await createTrainer("}
            <span className="usage-syntax usage-syntax--brace">{"{"}</span>
            {"\n  model,\n  method: reinforce("}
            <span className="usage-syntax usage-syntax--brace">{"{"}</span>
            {" bridge: execute("}
            <span className="usage-syntax usage-syntax--brace">{"{"}</span>
            {" runtime: "}
            <span className="usage-syntax usage-syntax--string">&apos;canvas&apos;</span>
            {" "}
            <span className="usage-syntax usage-syntax--brace">{"}"}</span>
            {") "}
            <span className="usage-syntax usage-syntax--brace">{"}"}</span>
            {"),\n"}
            <span className="usage-syntax usage-syntax--brace">{"}"}</span>
            {").fit(paintTasks)"}
          </CopyBlock>
          <p>
            The rest is in the <Link href="/docs">docs</Link>.
          </p>
        </section>

        <section className="usage-section" id="prompts" aria-labelledby="prompts-title">
          <h2 id="prompts-title">Prompts</h2>
          <p>Describe the task. Let an agent wire the trainer.</p>
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
            MIT. <Link href="/docs">Docs</Link>.{" "}
            <a href={GITHUB}>GitHub</a>. <code>pnpm example:paint</code>
          </p>
        </footer>
      </div>
    </section>
  );
}
