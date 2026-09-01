import type { Metadata } from "next";
import { CopyBlock } from "../../components/CopyBlock";

export const metadata: Metadata = {
  title: "Methods",
  description: "SFT, DPO, GRPO, JEPO, process, and mix.",
};

const MIX = `await createTrainer({
  model,
  method: mix(
    { method: sft(), weight: 0.3 },
    { method: jepo(), weight: 0.4 },
    { method: processMethod({ steps: [{ name: 'plan', test: /step 1/i }] }), weight: 0.3 },
  ),
}).fit(everything)`;

export default function MethodsDocs() {
  return (
    <article>
      <h2>Methods</h2>
      <p>
        A method is the loss. Pass it to <code>createTrainer</code>. <code>mix()</code> combines
        methods and still takes one optimizer step.
      </p>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Method</th>
            <th>Needs</th>
            <th>Loss</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>sft()</code>
            </td>
            <td>
              <code>target</code> or <code>completion</code>
            </td>
            <td>Next-token. Pad tokens are ignored.</td>
          </tr>
          <tr>
            <td>
              <code>prefer()</code>
            </td>
            <td>
              <code>chosen</code> / <code>rejected</code>
            </td>
            <td>DPO-style preference</td>
          </tr>
          <tr>
            <td>
              <code>reinforce({"{ bridge }"})</code>
            </td>
            <td>A score from a bridge</td>
            <td>GRPO, then a policy gradient</td>
          </tr>
          <tr>
            <td>
              <code>jepo()</code>
            </td>
            <td>Open-ended text</td>
            <td>Multi-sample Jensen bound</td>
          </tr>
          <tr>
            <td>
              <code>processMethod({"{ steps }"})</code>
            </td>
            <td>Regex or function checks</td>
            <td>Token loss weighted by which rules fired</td>
          </tr>
          <tr>
            <td>
              <code>mix(...parts)</code>
            </td>
            <td>Any of the above</td>
            <td>Weighted combination. One optimizer step.</td>
          </tr>
        </tbody>
      </table>
      <CopyBlock code={MIX}>{MIX}</CopyBlock>
      <p>
        GRPO advantages are zero-mean within a prompt group. If every sample in a group gets the same
        reward, the step is a no-op.
      </p>
    </article>
  );
}
