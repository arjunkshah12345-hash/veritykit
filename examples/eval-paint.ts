import { exportGroups, mockPolicy, paintCorpus, paintEnvironment, rollout } from "../src/index.js";

const good = paintCorpus()[0]!.target!;
const groups = await rollout(
  paintEnvironment(),
  mockPolicy((_, i) => (i === 0 ? good : "nope")),
  { generations: 2 },
);

console.log(exportGroups(groups));
