import type { Bridge, Task, Verifier, Witness } from "../types.js";

export type Check = {
  name: string;
  weight?: number;
  /** If this reads 0, the whole `score()` is 0. */
  gate?: boolean;
  read: (witness: Witness, task: Task, completion: string) => number;
};

export function score(...checks: Check[]): Verifier {
  const scored = checks.filter((c) => !c.gate);
  const total = scored.reduce((s, c) => s + (c.weight ?? 1), 0) || 1;
  return {
    async score({ task, completion, witness }) {
      let acc = 0;
      for (const check of checks) {
        const value = clamp(check.read(witness, task, completion));
        if (check.gate && value === 0) return 0;
        if (!check.gate) acc += value * ((check.weight ?? 1) / total);
      }
      if (scored.length === 0) return 1;
      return clamp(acc);
    },
  };
}

export function gate(check: Check): Check {
  return { ...check, gate: true, weight: 0 };
}

export function ran(weight = 1): Check {
  return {
    name: "ran",
    weight,
    read: (w) => w.metrics.ran ?? (w.ok ? 1 : 0),
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

/** Binary: did the completion use the allowed API. */
export function uses(pattern: RegExp, weight = 1): Check {
  return {
    name: "uses",
    weight,
    read: (_w, _t, completion) => (pattern.test(completion) ? 1 : 0),
  };
}

/**
 * Win-rate against a reference pool. Prefer this over five 0–10 judges
 * that all measure the same aesthetic.
 */
export function pairwise(options: {
  references: string[];
  compare: (input: { task: Task; candidate: string; against: string }) => number | Promise<number>;
  n?: number;
  seed?: number;
}): Verifier {
  const n = options.n ?? 2;
  return {
    async score({ task, completion }) {
      const refs = pick(options.references, n, options.seed);
      if (refs.length === 0) return 0;
      let wins = 0;
      for (const against of refs) {
        wins += clamp(await options.compare({ task, candidate: completion, against }));
      }
      return clamp(wins / refs.length);
    },
  };
}

export function combine(...parts: Array<{ verifier: Verifier; weight?: number; gate?: boolean }>): Verifier {
  const scored = parts.filter((p) => !p.gate);
  const total = scored.reduce((s, p) => s + (p.weight ?? 1), 0) || 1;
  return {
    async score(input) {
      let acc = 0;
      for (const part of parts) {
        const value = clamp(await part.verifier.score(input));
        if (part.gate && value === 0) return 0;
        if (!part.gate) acc += value * ((part.weight ?? 1) / total);
      }
      if (scored.length === 0) return 1;
      return clamp(acc);
    },
  };
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

function pick<T>(items: T[], n: number, seed?: number): T[] {
  if (items.length === 0) return [];
  const k = Math.min(Math.max(1, n), items.length);
  const copy = items.slice();
  let state = seed ?? Math.floor(Math.random() * 2 ** 31);
  const rand = () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy.slice(0, k);
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
  return {
    witness,
    reward: clamp(await verifier.score({ task: input.task, completion: input.completion, witness })),
  };
}
