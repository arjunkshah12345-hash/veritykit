import type { Metadata } from "next";
import { CopyBlock } from "../../components/CopyBlock";

export const metadata: Metadata = {
  title: "Install",
  description: "Add veritykit and run the examples.",
};

const ADD = "pnpm add veritykit";
const EXAMPLES = `pnpm install
pnpm test
pnpm example:lm
pnpm example:paint
pnpm example:open`;

export default function InstallDocs() {
  return (
    <article>
      <h2>Install</h2>
      <p>Node 18. No runtime dependencies.</p>
      <CopyBlock code={ADD}>
        <span className="usage-syntax usage-syntax--keyword">pnpm add</span>
        <span> veritykit</span>
      </CopyBlock>
      <p>From the repo:</p>
      <CopyBlock code={EXAMPLES}>{EXAMPLES}</CopyBlock>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Path</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>createTrainer</code>
            </td>
            <td>Update the local GPT. Prove a method.</td>
          </tr>
          <tr>
            <td>
              <code>environment</code> + <code>httpPolicy</code>
            </td>
            <td>Roll out a hosted model. Collect witnesses and advantages.</td>
          </tr>
        </tbody>
      </table>
      <p>
        The JS runner uses <code>node:vm</code>. Isolation for a training loop, not a security
        sandbox.
      </p>
    </article>
  );
}
