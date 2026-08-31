import type { Completion, Policy } from "../types.js";

export type HttpPolicyConfig = {
  model: string;
  apiKey?: string;
  baseURL?: string;
};

/** OpenAI-compatible chat policy. Use for eval / export, not local backprop. */
export function httpPolicy(config: HttpPolicyConfig): Policy {
  const baseURL = (config.baseURL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const apiKey = config.apiKey ?? process.env.OPENAI_API_KEY ?? "";

  return {
    async generate({ prompt, n = 1, temperature = 0.8 }): Promise<Completion[]> {
      const res = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: config.model,
          n,
          temperature,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        const body = (await res.text()).slice(0, 240);
        throw new Error(`httpPolicy ${res.status}: ${body}`);
      }
      const json = (await res.json()) as {
        choices: Array<{ message?: { content?: string }; text?: string }>;
      };
      return json.choices.map((c) => ({ text: c.message?.content ?? c.text ?? "" }));
    },
  };
}

export function mockPolicy(fn: (prompt: string, i: number) => string): Policy {
  return {
    async generate({ prompt, n = 1 }) {
      return Array.from({ length: n }, (_, i) => ({ text: fn(prompt, i) }));
    },
  };
}
