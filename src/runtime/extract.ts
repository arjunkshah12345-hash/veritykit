const FENCE = /```(?:javascript|js|typescript|ts)?\s*([\s\S]*?)```/i;

export function extractCode(text: string): string {
  const fenced = text.match(FENCE);
  if (fenced?.[1]) return fenced[1].trim();
  return text.trim();
}

/** Split a freeform completion into thought (latent z) and answer (observed y). */
export function splitThought(text: string): { thought: string; answer: string } {
  const boxed = text.match(/\\boxed\{([^}]*)\}/);
  if (boxed?.[1]) {
    return { thought: text.slice(0, boxed.index).trim(), answer: boxed[1].trim() };
  }
  const marked = text.split(/\n(?:answer|final)\s*:\s*/i);
  if (marked.length >= 2) {
    return { thought: marked[0]!.trim(), answer: marked.slice(1).join("\n").trim() };
  }
  const lines = text.trim().split(/\n+/);
  if (lines.length < 2) return { thought: "", answer: text.trim() };
  return { thought: lines.slice(0, -1).join("\n"), answer: lines[lines.length - 1]!.trim() };
}
