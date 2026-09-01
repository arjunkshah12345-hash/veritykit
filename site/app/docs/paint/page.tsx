import type { Metadata } from "next";
import Link from "next/link";
import { CopyBlock } from "../../components/CopyBlock";

export const metadata: Metadata = {
  title: "Paint with JavaScript",
  description: "SFT on canvas programs, then GRPO against an executor.",
};

const CODE = `import { CANVAS_API, createTrainer, execute, gate, metric, paintCorpus, ran, reinforce, score, sft, uses } from 'veritykit'

await createTrainer({ model, method: sft() }).fit(paintCorpus())

await createTrainer({
  model,
  method: reinforce({
    bridge: execute({ runtime: 'canvas', size: 64 }),
    verifier: score(gate(ran()), gate(uses(CANVAS_API)), metric('coverage'), metric('colorDiversity')),
  }),
}).fit(paintCorpus().map(({ prompt }) => ({ prompt })))`;

export default function PaintDocs() {
  return (
    <article>
      <h2>Paint with JavaScript</h2>
      <p>
        Example environment: the model writes canvas JavaScript. Train with SFT, then GRPO against
        an executor. Score “it ran,” “it used the API,” coverage, and color.
      </p>
      <CopyBlock code={CODE}>{CODE}</CopyBlock>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Signal</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>ran</code>
            </td>
            <td>The program executed without throwing</td>
          </tr>
          <tr>
            <td>
              <code>uses</code>
            </td>
            <td>The completion touched the allowlist</td>
          </tr>
          <tr>
            <td>
              <code>coverage</code>
            </td>
            <td>Non-blank pixels</td>
          </tr>
          <tr>
            <td>
              <code>colorDiversity</code>
            </td>
            <td>Distinct quantized colors</td>
          </tr>
        </tbody>
      </table>
      <p>
        <code>canvasPrompt(task)</code> appends the allowlist. <code>paintPool()</code> is the
        working programs for <code>pairwise</code>. Reward design is in{" "}
        <Link href="/docs/reward">Reward</Link>. Run <code>pnpm example:paint</code>.
      </p>
    </article>
  );
}
