import type { Bridge, Policy, Task, Verifier } from "../types.js";
import { groupByTask } from "../train/advantage.js";
import { defaultVerifier, verify } from "../verify/score.js";

export type EnvironmentConfig = {
  name: string;
  tasks: Task[];
  bridge: Bridge;
  verifier?: Verifier;
};

export type Environment = EnvironmentConfig & {
  evaluate(policy: Policy, opts?: { generations?: number; temperature?: number }): Promise<ReturnType<typeof groupByTask>>;
};

export function environment(config: EnvironmentConfig): Environment {
  const verifier = config.verifier ?? defaultVerifier(config.bridge);
  return {
    ...config,
    verifier,
    async evaluate(policy, opts = {}) {
      const generations = opts.generations ?? 4;
      const episodes = [];
      for (const task of config.tasks) {
        const completions = await policy.generate({
          prompt: task.prompt,
          n: generations,
          temperature: opts.temperature ?? 0.8,
        });
        for (const completion of completions) {
          const { witness, reward } = await verify({
            task,
            completion: completion.text,
            bridge: config.bridge,
            verifier,
          });
          episodes.push({ task, completion, witness, reward });
        }
      }
      return groupByTask(episodes);
    },
  };
}

export async function rollout(
  env: Environment,
  policy: Policy,
  opts?: { generations?: number; temperature?: number },
) {
  return env.evaluate(policy, opts);
}
