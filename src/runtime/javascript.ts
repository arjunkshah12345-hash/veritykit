import { createContext, runInContext } from "node:vm";
import { SoftwareCanvas } from "./canvas.js";
import { extractCode } from "./extract.js";

export type JsRunResult = {
  ok: boolean;
  canvas?: SoftwareCanvas;
  value?: unknown;
  logs: string[];
  error?: string;
  ms: number;
};

/**
 * Isolated-enough JS runner for training loops.
 * This is not a security sandbox — do not run untrusted production traffic in it.
 */
export function runJavascript(
  source: string,
  opts: { timeout?: number; size?: number } = {},
): JsRunResult {
  const logs: string[] = [];
  const size = opts.size ?? 64;
  const canvas = new SoftwareCanvas(size, size);
  const ctx = canvas.getContext();
  const started = Date.now();
  const sandbox = {
    console: {
      log: (...args: unknown[]) => {
        logs.push(args.map(String).join(" "));
      },
    },
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,
    JSON,
    canvas,
    ctx,
    document: {
      getElementById: () => canvas,
      createElement: () => canvas,
      querySelector: () => canvas,
    },
  };

  try {
    const context = createContext(sandbox);
    const value = runInContext(extractCode(source), context, {
      timeout: opts.timeout ?? 250,
      displayErrors: true,
    });
    return { ok: true, canvas, value, logs, ms: Date.now() - started };
  } catch (error) {
    return {
      ok: false,
      canvas,
      logs,
      error: error instanceof Error ? error.message : String(error),
      ms: Date.now() - started,
    };
  }
}
