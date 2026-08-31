import type { Bridge, Task, Verifier, Witness } from "../types.js";

export type Check = {
  name: string;
  weight?: number;
  read: (witness: Witness, task: Task, completion: string) => number;
};

export function score(...checks: Check[]): Verifier {
  const total = checks.reduce((s, c) => s + (c.weight ?? 1), 0) || 1;
  return {
    score({ task, completion, witness }) {
      let acc = 0;
      for (const check of checks) {
        acc += clamp(check.read(witness, task, completion)) * ((check.weight ?? 1) / total);
      }
      return clamp(acc);
    },
  };
}

export function ran(weight = 1): Check {
  return {
    name: "ran",
    weight,
    read: (w) => (w.metrics.ran ?? (w.ok ? 1 : 0)),
  };
}

export function metric(name: string, weight = 1): Check {
  return {
    name,
    weight,
    read: (w) => w.metrics[name] ?? 0,
  };
}

export function ok(weight = 1): Check {
  return { name: "ok", weight, read: (w) => (w.ok ? 1 : 0) };
}

export function defaultVerifier(_bridge?: Bridge): Verifier {
  return {
    score({ witness }) {
      if (typeof witness.metrics.compose === "number") return clamp(witness.metrics.compose);
      const vals = Object.values(witness.metrics);
      if (vals.length === 0) return witness.ok ? 1 : 0;
      return clamp(vals.reduce((a, b) => a + b, 0) / vals.length);
    },
  };
}

function clamp(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export async function verify(input: {
  task: Task;
  completion: string;
  bridge: Bridge;
  verifier?: Verifier;
}): Promise<{ witness: Witness; reward: number }> {
  const witness = await input.bridge.run({ task: input.task, completion: input.completion });
  const verifier = input.verifier ?? defaultVerifier(input.bridge);
  return { witness, reward: verifier.score({ task: input.task, completion: input.completion, witness }) };
}
