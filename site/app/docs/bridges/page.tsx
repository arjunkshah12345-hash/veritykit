import type { Metadata } from "next";
import { CopyBlock } from "../../components/CopyBlock";

export const metadata: Metadata = {
  title: "Bridges",
  description: "Run or check a completion so you can score it.",
};

const COMPOSE = `import { compose, execute, match } from 'veritykit'

const bridge = compose([
  { bridge: execute({ runtime: 'javascript' }), weight: 0.6 },
  { bridge: match({ mode: 'contains' }), weight: 0.4 },
])`;

export default function BridgesDocs() {
  return (
    <article>
      <h2>Bridges</h2>
      <p>
        A bridge runs or checks the model’s output and returns metrics. The scorer turns those
        metrics into a number in [0, 1].
      </p>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Bridge</th>
            <th>When</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>execute</code>
            </td>
            <td>The model writes code</td>
            <td>It ran. You get pixel or log metrics.</td>
          </tr>
          <tr>
            <td>
              <code>match</code>
            </td>
            <td>There is a known answer</td>
            <td>Exact, numeric, or contains</td>
          </tr>
          <tr>
            <td>
              <code>process</code>
            </td>
            <td>You can check steps</td>
            <td>Which regex or function checks passed</td>
          </tr>
          <tr>
            <td>
              <code>reformulate</code>
            </td>
            <td>No gold answer</td>
            <td>Rank N samples against each other</td>
          </tr>
          <tr>
            <td>
              <code>judge</code>
            </td>
            <td>You have a critic function</td>
            <td>A score you define</td>
          </tr>
          <tr>
            <td>
              <code>latent</code> / <code>jepo</code>
            </td>
            <td>Open-ended text</td>
            <td>Split thought from the last span</td>
          </tr>
        </tbody>
      </table>

      <h3>Compose</h3>
      <p>Combine two checks when one is not enough.</p>
      <CopyBlock code={COMPOSE}>{COMPOSE}</CopyBlock>
    </article>
  );
}
