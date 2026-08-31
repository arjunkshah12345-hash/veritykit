import type { Metadata } from "next";
import { CopyBlock } from "../../components/CopyBlock";

export const metadata: Metadata = {
  title: "Bridges",
  description: "Turn a completion into a witness you can score.",
};

const COMPOSE = `import { compose, execute, judge } from 'veritykit'

const bridge = compose([
  { bridge: execute({ runtime: 'canvas' }), weight: 0.6 },
  { bridge: judge({ rubric: 'Does this look like a sunset?', score }), weight: 0.4 },
])`;

export default function BridgesDocs() {
  return (
    <article>
      <h2>Bridges</h2>
      <p>
        A bridge turns a completion into a witness. The verifier then reads metrics off that witness
        and returns a number in [0, 1].
      </p>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Bridge</th>
            <th>Use when</th>
            <th>What becomes true</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>execute</code>
            </td>
            <td>The model emits code, SVG, JS, a sim</td>
            <td>It ran. Metrics exist.</td>
          </tr>
          <tr>
            <td>
              <code>match</code>
            </td>
            <td>There is a gold short answer</td>
            <td>Classic RLVR</td>
          </tr>
          <tr>
            <td>
              <code>process</code>
            </td>
            <td>Structure is checkable even if the answer is not</td>
            <td>Step rules fired</td>
          </tr>
          <tr>
            <td>
              <code>reformulate</code>
            </td>
            <td>Open-ended, no gold</td>
            <td>N samples become a ranking</td>
          </tr>
          <tr>
            <td>
              <code>judge</code>
            </td>
            <td>You accept a model critic</td>
            <td>A contracted score</td>
          </tr>
          <tr>
            <td>
              <code>latent</code> / <code>jepo</code>
            </td>
            <td>Nothing is checkable</td>
            <td>Thought is z, last span is y</td>
          </tr>
        </tbody>
      </table>

      <h3>Compose</h3>
      <p>
        Mix witnesses when one signal is not enough. Typical paint stack: execute for hard
        constraints, then a judge for “does this look like a sunset.”
      </p>
      <CopyBlock code={COMPOSE}>{COMPOSE}</CopyBlock>

      <h3>Research this maps to</h3>
      <ul>
        <li>RLVR — match, execute</li>
        <li>VPRM — process</li>
        <li>VMR-RLVR — reformulate</li>
        <li>RULER / RLAIF — judge</li>
        <li>
          JEPO (NeurIPS 2025,{" "}
          <a href="https://arxiv.org/abs/2503.19618">arXiv:2503.19618</a>) — latent / jepo
        </li>
      </ul>
    </article>
  );
}
