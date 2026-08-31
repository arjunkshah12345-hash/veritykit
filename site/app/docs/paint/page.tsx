import type { Metadata } from "next";
import { CopyBlock } from "../../components/CopyBlock";

export const metadata: Metadata = {
  title: "Paint with JavaScript",
  description: "SFT on canvas programs, then GRPO against an executor.",
};

const CODE = `import { createTrainer, execute, metric, paintCorpus, ran, reinforce, score, sft } from 'veritykit'

await createTrainer({ model, method: sft() }).fit(paintCorpus())

await createTrainer({
  model,
  method: reinforce({
    bridge: execute({ runtime: 'canvas', size: 64 }),
    verifier: score(ran(2), metric('coverage'), metric('colorDiversity')),
  }),
}).fit(paintCorpus().map(({ prompt }) => ({ prompt })))`;

export default function PaintDocs() {
  return (
    <article>
      <h2>Paint with JavaScript</h2>
      <p>
        The picture is subjective. The program is not. Execute it, measure coverage and color, then
        train.
      </p>
      <CopyBlock code={CODE}>{CODE}</CopyBlock>
      <p>
        Recipe: SFT on a few working canvas programs, then GRPO against the executor. That is the
        same order used by SVG / frontend RL work (SFT, then a visual or metric reward).
      </p>

      <h3>What the executor reports</h3>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Metric</th>
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
              <code>coverage</code>
            </td>
            <td>Share of pixels that are not the blank background</td>
          </tr>
          <tr>
            <td>
              <code>colorDiversity</code>
            </td>
            <td>How many distinct quantized colors showed up</td>
          </tr>
          <tr>
            <td>
              <code>ink</code>
            </td>
            <td>Non-white mass. Zero ink means the canvas stayed empty.</td>
          </tr>
        </tbody>
      </table>

      <h3>Safety</h3>
      <p>
        The bundled runner uses <code>node:vm</code> plus a software canvas. It is isolation for a
        training loop, not a production security sandbox.
      </p>
      <p>
        Run the full example with <code>pnpm example:paint</code>.
      </p>
    </article>
  );
}
