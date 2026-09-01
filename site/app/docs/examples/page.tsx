import type { Metadata } from "next";
import { CopyBlock } from "../../components/CopyBlock";

export const metadata: Metadata = {
  title: "Examples",
  description: "SFT a language model, paint with JavaScript, train on proofs.",
};

const RUN = `pnpm example:lm
pnpm example:paint
pnpm example:open
pnpm example:eval`;

export default function ExamplesDocs() {
  return (
    <article>
      <h2>Examples</h2>
      <p>Four scripts in the repo. Each one should move a number without an API key.</p>
      <CopyBlock code={RUN}>{RUN}</CopyBlock>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Script</th>
            <th>What it proves</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>examples/char-lm.ts</code>
            </td>
            <td>SFT a tiny character LM. Loss should collapse.</td>
          </tr>
          <tr>
            <td>
              <code>examples/paint-js.ts</code>
            </td>
            <td>SFT on canvas programs, then GRPO against the executor.</td>
          </tr>
          <tr>
            <td>
              <code>examples/unverifiable.ts</code>
            </td>
            <td>Mix SFT, JEPO, and process checks on proofs with no short gold answer.</td>
          </tr>
          <tr>
            <td>
              <code>examples/eval-paint.ts</code>
            </td>
            <td>Roll out the paint env with a mock policy. Print JSONL groups.</td>
          </tr>
        </tbody>
      </table>
      <p>
        Expected local trainer: SFT loss on the character LM goes from about 5.5 toward 0. The
        unverifiable mix should drop the Jensen term. Those numbers are laptop-scale, not a
        benchmark claim.
      </p>
    </article>
  );
}
