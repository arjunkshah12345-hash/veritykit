import type { Metadata } from "next";
import { CopyBlock } from "../../components/CopyBlock";

export const metadata: Metadata = {
  title: "Reward",
  description: "Gate first. Do not stack correlated judges. Prefer pairwise.",
};

const CODE = `import { CANVAS_API, combine, gate, pairwise, ran, score, uses } from 'veritykit'

const compile = score(gate(ran()), gate(uses(CANVAS_API)))

const taste = pairwise({
  references: loveTier,
  n: 2,
  compare: ({ candidate, against }) => Number(prefer(candidate, against)),
})

const verifier = combine({ verifier: compile, gate: true }, { verifier: taste, weight: 1 })`;

export default function RewardDocs() {
  return (
    <article>
      <h2>Reward</h2>
      <p>
        Aesthetic RL is a reward-design problem. The program can be checked. Taste cannot. Author
        the few signals that actually move the model.
      </p>
      <ul>
        <li>
          <strong>Gate first.</strong> If it did not run, or it did not use the API, the score is 0.
        </li>
        <li>
          <strong>Do not stack correlated judges.</strong> Five “is this pretty?” scores are one
          score five times.
        </li>
        <li>
          <strong>Prefer pairwise.</strong> A 0–10 judge compresses. “Which is the better sunset?”
          does not.
        </li>
        <li>
          <strong>Short allowlist.</strong> A long API dump makes models invent methods.
        </li>
      </ul>
      <CopyBlock code={CODE}>{CODE}</CopyBlock>
      <p>
        <code>paintEnvironment()</code> ships the compile gates plus coverage and color. Prompts
        include <code>canvasPrompt()</code>. <code>paintPool()</code> is the working programs.{" "}
        <code>pairwise</code> samples <code>n</code> references from the pool.
      </p>
    </article>
  );
}
