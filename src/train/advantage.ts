import type { Episode, Group } from "../types.js";

export function advantages(episodes: Episode[], eps = 1e-6): Group["episodes"] {
  const rewards = episodes.map((e) => e.reward);
  const mean = rewards.reduce((a, b) => a + b, 0) / Math.max(1, rewards.length);
  const variance = rewards.reduce((a, r) => a + (r - mean) ** 2, 0) / Math.max(1, rewards.length);
  const std = Math.sqrt(variance);
  return episodes.map((episode) => ({
    ...episode,
    advantage: (episode.reward - mean) / (std + eps),
  }));
}

export function groupByTask(episodes: Episode[]): Group[] {
  const map = new Map<string, Episode[]>();
  for (const episode of episodes) {
    const key = episode.task.id ?? episode.task.prompt;
    const list = map.get(key) ?? [];
    list.push(episode);
    map.set(key, list);
  }
  return [...map.entries()].map(([, list]) => ({
    task: list[0]!.task,
    episodes: advantages(list),
  }));
}
