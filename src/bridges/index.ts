import type { Bridge, Task, Witness } from "../types.js";
import { runJavascript } from "../runtime/javascript.js";
import { splitThought } from "../runtime/extract.js";

export type ExecuteOptions = {
  runtime?: "javascript" | "canvas";
  timeout?: number;
  size?: number;
};

export function execute(options: ExecuteOptions = {}): Bridge {
  const runtime = options.runtime ?? "canvas";
  return {
    kind: "execute",
    run({ completion }): Witness {
      const result = runJavascript(completion, {
        ...(options.timeout !== undefined ? { timeout: options.timeout } : {}),
        ...(options.size !== undefined ? { size: options.size } : {}),
      });
      const metrics = result.canvas?.metrics() ?? {};
      return {
        ok: result.ok && (runtime === "javascript" || (metrics.ink ?? 0) > 0),
        kind: "execute",
        artifact: result.canvas,
        metrics: { ...metrics, ran: result.ok ? 1 : 0 },
        logs: result.logs,
        ...(result.error !== undefined ? { error: result.error } : {}),
      };
    },
  };
}

export type MatchMode = "exact" | "numeric" | "contains";

export function match(options: { mode?: MatchMode; getAnswer?: (task: Task) => string | undefined } = {}): Bridge {
  const mode = options.mode ?? "exact";
  return {
    kind: "match",
    run({ task, completion }): Witness {
      const gold = options.getAnswer?.(task) ?? task.answer ?? task.target;
      if (gold === undefined) {
        return { ok: false, kind: "match", metrics: { match: 0 }, logs: [], error: "no gold answer" };
      }
      const pred = completion.trim();
      let ok = false;
      if (mode === "exact") ok = pred === gold.trim();
      else if (mode === "contains") ok = pred.includes(gold.trim()) || gold.trim().includes(pred);
      else {
        const a = Number(pred.replace(/[^\d.-]/g, ""));
        const b = Number(gold.replace(/[^\d.-]/g, ""));
        ok = Number.isFinite(a) && a === b;
      }
      return { ok, kind: "match", metrics: { match: ok ? 1 : 0 }, logs: [] };
    },
  };
}

export type ProcessStep = {
  name: string;
  test: RegExp | ((text: string) => boolean);
};

export function process(options: { steps: ProcessStep[] }): Bridge {
  return {
    kind: "process",
    run({ completion }): Witness {
      const metrics: Record<string, number> = {};
      let passed = 0;
      for (const step of options.steps) {
        const ok = typeof step.test === "function" ? step.test(completion) : step.test.test(completion);
        metrics[step.name] = ok ? 1 : 0;
        if (ok) passed += 1;
      }
      const ratio = options.steps.length === 0 ? 0 : passed / options.steps.length;
      return {
        ok: ratio === 1,
        kind: "process",
        metrics: { ...metrics, process: ratio },
        logs: [],
      };
    },
  };
}

export function judge(options: {
  rubric: string;
  score: (input: { task: Task; completion: string; rubric: string }) => number | Promise<number>;
}): Bridge {
  return {
    kind: "judge",
    async run({ task, completion }): Promise<Witness> {
      const value = clamp01(await options.score({ task, completion, rubric: options.rubric }));
      return {
        ok: value > 0,
        kind: "judge",
        metrics: { judge: value },
        logs: [options.rubric],
      };
    },
  };
}

/**
 * JEPO-style latent split: treat chain-of-thought as z and the last answer as y.
 * The witness records the split so the trainer can optimize the Jensen bound.
 */
export function latent(): Bridge {
  return {
    kind: "latent",
    run({ completion }): Witness {
      const { thought, answer } = splitThought(completion);
      return {
        ok: answer.length > 0,
        kind: "latent",
        artifact: { thought, answer },
        metrics: {
          thoughtLen: Math.min(1, thought.length / 200),
          answerLen: Math.min(1, answer.length / 40),
        },
        logs: [],
      };
    },
  };
}

/**
 * Turn an open-ended prompt into a verifiable comparison among N completions.
 * Call `compare()` after you have a group of texts.
 */
export function reformulate(options: {
  compare?: (texts: string[]) => number[];
} = {}): {
  kind: "reformulate";
  rank(texts: string[]): number[];
} {
  return {
    kind: "reformulate",
    rank(texts) {
      if (options.compare) return options.compare(texts);
      return heuristicRank(texts);
    },
  };
}

export function compose(parts: Array<{ bridge: Bridge; weight?: number }>): Bridge {
  const total = parts.reduce((s, p) => s + (p.weight ?? 1), 0);
  return {
    kind: "compose",
    async run(input): Promise<Witness> {
      const metrics: Record<string, number> = {};
      const logs: string[] = [];
      let mixed = 0;
      let ok = true;
      let artifact: unknown;
      for (const part of parts) {
        const w = await part.bridge.run(input);
        ok = ok && w.ok;
        logs.push(...w.logs);
        Object.assign(metrics, w.metrics);
        artifact = w.artifact ?? artifact;
        mixed += meanMetric(w) * ((part.weight ?? 1) / total);
      }
      metrics.compose = mixed;
      return { ok, kind: "compose", artifact, metrics, logs };
    },
  };
}

export function heuristicRank(texts: string[]): number[] {
  const scores = texts.map((text) => {
    const unique = new Set(text).size;
    const lines = text.trim().split(/\n/).length;
    return unique * 0.01 + Math.min(lines, 8) * 0.05 + Math.min(text.length, 200) * 0.002;
  });
  const max = Math.max(...scores, 1e-9);
  return scores.map((s) => s / max);
}

function meanMetric(w: Witness): number {
  const vals = Object.values(w.metrics);
  if (vals.length === 0) return w.ok ? 1 : 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}
