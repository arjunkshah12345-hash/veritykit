import type { Metadata } from "next";
import { CopyBlock } from "../../components/CopyBlock";

export const metadata: Metadata = {
  title: "API",
  description: "Conservative named exports for veritykit.",
};

const TYPES = `import type { Bridge, Episode, Method, Policy, Task, Witness } from 'veritykit'`;

export default function ApiDocs() {
  return (
    <article>
      <h2>API</h2>
      <p>Conservative surface. Named exports only.</p>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Export</th>
            <th>Signature</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>createModel</code>
            </td>
            <td>
              <code>createModel(tokenizer | text, {"{ dim, layers, heads, context, seed }"})</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>createTrainer</code>
            </td>
            <td>
              <code>createTrainer({"{ model, method, epochs, batchSize, optimizer, maxGradNorm, onStep }"})</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>environment</code>
            </td>
            <td>
              <code>environment({"{ name, tasks, bridge, verifier }"})</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>rollout</code>
            </td>
            <td>
              <code>rollout(env, policy, {"{ generations, temperature }"})</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>execute</code>
            </td>
            <td>
              <code>execute({"{ runtime: 'canvas' | 'javascript', size, timeout }"})</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>match</code>
            </td>
            <td>
              <code>match({"{ mode: 'exact' | 'numeric' | 'contains' }"})</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>process</code>
            </td>
            <td>
              <code>process({"{ steps }"})</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>judge</code>
            </td>
            <td>
              <code>judge({"{ rubric, score }"})</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>latent</code> / <code>jepo</code>
            </td>
            <td>
              <code>latent()</code> · <code>jepo({"{ samples, maxTokens }"})</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>reformulate</code>
            </td>
            <td>
              <code>reformulate({"{ compare }"}).rank(texts)</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>score</code>
            </td>
            <td>
              <code>score(gate(ran()), gate(uses(re)), metric(&apos;coverage&apos;), …)</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>gate</code> / <code>uses</code>
            </td>
            <td>Hard compile / allowlist checks</td>
          </tr>
          <tr>
            <td>
              <code>pairwise</code>
            </td>
            <td>
              <code>pairwise({"{ references, compare, n, seed }"})</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>combine</code>
            </td>
            <td>Mix verifiers. <code>gate: true</code> zeros the rest</td>
          </tr>
          <tr>
            <td>
              <code>canvasPrompt</code>
            </td>
            <td>Task plus the canvas allowlist</td>
          </tr>
          <tr>
            <td>
              <code>paintPool</code>
            </td>
            <td>Working programs from <code>paintCorpus</code></td>
          </tr>
          <tr>
            <td>
              <code>httpPolicy</code>
            </td>
            <td>
              <code>httpPolicy({"{ model, apiKey, baseURL }"})</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>mockPolicy</code>
            </td>
            <td>
              <code>mockPolicy((prompt, i) =&gt; text)</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>exportGroups</code>
            </td>
            <td>
              <code>exportGroups(groups)</code> → JSONL
            </td>
          </tr>
        </tbody>
      </table>
      <CopyBlock code={TYPES}>{TYPES}</CopyBlock>
      <p>
        Types to import when you need them: <code>Task</code>, <code>Witness</code>,{" "}
        <code>Bridge</code>, <code>Method</code>, <code>Policy</code>, <code>Episode</code>,{" "}
        <code>Group</code>.
      </p>
    </article>
  );
}
