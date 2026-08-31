import type { Metadata } from "next";
import Link from "next/link";
import { CopyBlock } from "../components/CopyBlock";

export const metadata: Metadata = {
  title: "Overview",
  description: "Train models on any data, including data you cannot verify.",
};

const LOOP = `task → model → completion → bridge → witness → method → update`;

export default function DocsHome() {
  return (
    <article>
      <h2>Overview</h2>
      <p>
        Verity trains on data you cannot verify. The scarce primitive is the bridge: it turns an
        output into a witness you can score.
      </p>
      <CopyBlock code={LOOP}>{LOOP}</CopyBlock>
      <p>
        A witness is evidence the work happened: pixels, a process trace, a ranking, or a latent
        thought/answer split.
      </p>

      <h3>Start here</h3>
      <ul>
        <li>
          <Link href="/docs/install">Install</Link> and run the examples
        </li>
        <li>
          Pick a <Link href="/docs/bridges">bridge</Link>
        </li>
        <li>
          Pick a <Link href="/docs/methods">method</Link>, or <code>mix()</code>
        </li>
        <li>
          Hosted models: <Link href="/docs/environments">environment</Link>, then export advantages
        </li>
      </ul>

      <h3>What ships</h3>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Piece</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Tensor + GPT</td>
            <td>Autograd and a laptop-scale causal LM</td>
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
            <td>
              <code>execute</code> <code>match</code> <code>process</code> <code>judge</code>{" "}
              <code>latent</code> <code>reformulate</code> <code>compose</code>
            </td>
          </tr>
          <tr>
            <td>Environments</td>
            <td>
              Tasks + bridge + verifier. Hosted models use <code>httpPolicy</code>.
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Limit</h3>
      <p>
        The local trainer is a reference. For a large model, collect groups and hand them to TRL,
        veRL, or ART.
      </p>
    </article>
  );
}
