import type { Metadata } from "next";
import Link from "next/link";
import { CopyBlock } from "../components/CopyBlock";

export const metadata: Metadata = {
  title: "Overview",
  description: "TypeScript training framework. SFT, DPO, GRPO.",
};

const SETUP = `import { createModel, createTrainer, sft } from 'veritykit'

const model = createModel(text, { dim: 64, layers: 2, heads: 4 })
await createTrainer({ model, method: sft() }).fit(labeled)`;

export default function DocsHome() {
  return (
    <article>
      <h2>Overview</h2>
      <p>
        Verity is a small TypeScript library for training language models. Supervised fine-tuning,
        preference (DPO), and reinforcement (GRPO) share one trainer.
      </p>
      <CopyBlock code={SETUP}>{SETUP}</CopyBlock>
      <p>
        <code>createTrainer</code> updates a local GPT that ships with the package. To score a
        hosted model, build an environment and call <code>rollout</code>.
      </p>

      <h3>Start here</h3>
      <ul>
        <li>
          <Link href="/docs/install">Install</Link> and run <code>pnpm example:lm</code>
        </li>
        <li>
          Pick a <Link href="/docs/methods">method</Link>
        </li>
        <li>
          If you need to run or check the output, pick a <Link href="/docs/bridges">bridge</Link>
        </li>
        <li>
          Hosted APIs: <Link href="/docs/environments">environments</Link>
        </li>
      </ul>

      <h3>What is in the box</h3>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Piece</th>
            <th>What it does</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Model</td>
            <td>
              <code>createModel</code> — tiny GPT + tokenizer
            </td>
          </tr>
          <tr>
            <td>Trainer</td>
            <td>
              <code>createTrainer</code> — epochs, batches, Adam
            </td>
          </tr>
          <tr>
            <td>Methods</td>
            <td>
              <code>sft</code> <code>prefer</code> <code>reinforce</code> <code>jepo</code>{" "}
              <code>processMethod</code> <code>mix</code>
            </td>
          </tr>
          <tr>
            <td>Bridges</td>
            <td>Run or check a completion so you can score it</td>
          </tr>
          <tr>
            <td>Environments</td>
            <td>Tasks + scorer. Works with the local model or <code>httpPolicy</code></td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}
