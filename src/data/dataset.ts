import type { Example } from "../types.js";

export type Dataset = Example[];

export function dataset(rows: Example[]): Dataset {
  return rows.map((row, i) => ({
    id: row.id ?? String(i),
    ...row,
  }));
}

export function batches<T>(items: readonly T[], size: number): T[][] {
  if (size <= 0) throw new Error("batch size must be > 0");
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Mix labeled, preference, and open-ended rows in one stream. */
export function mixData(...parts: Dataset[]): Dataset {
  return parts.flat().map((row, i) => ({ ...row, id: row.id ?? String(i) }));
}

export function chunkText(text: string, size: number, stride = size): Example[] {
  const rows: Example[] = [];
  for (let i = 0; i + 2 < text.length && i < text.length; i += stride) {
    const slice = text.slice(i, i + size);
    if (slice.length < 4) continue;
    rows.push({ prompt: "", target: slice });
  }
  return rows;
}
