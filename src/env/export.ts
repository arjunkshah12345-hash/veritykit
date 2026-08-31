import type { Group } from "../types.js";

/** JSONL of prompt groups. Advantage is already computed. */
export function exportGroups(groups: Group[]): string {
  return groups
    .map((group) =>
      JSON.stringify({
        id: group.task.id,
        prompt: group.task.prompt,
        episodes: group.episodes.map((episode) => ({
          text: episode.completion.text,
          reward: episode.reward,
          advantage: episode.advantage,
          metrics: episode.witness.metrics,
        })),
      }),
    )
    .join("\n");
}
