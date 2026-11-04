import OpenAI from "openai";

const DEFAULT_MODEL = "gpt-4o-mini";

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export class OpenAIChatError extends Error {
  constructor(public kind: "auth" | "unavailable") {
    super(`OpenAI ${kind}`);
  }
}

export type OpenAITurn = { role: "user" | "assistant"; content: string };

/** Streams the assistant's reply as plain-text deltas without exposing the API key. */
export async function streamOpenAIReply(
  systemPrompt: string,
  turns: OpenAITurn[],
  signal?: AbortSignal
): Promise<{ stream: ReadableStream<Uint8Array> }> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  let completion: Awaited<ReturnType<typeof client.chat.completions.create>>;

  try {
    completion = await client.chat.completions.create(
      {
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        messages: [{ role: "system", content: systemPrompt }, ...turns],
        max_completion_tokens: 1024,
        stream: true,
      },
      { signal }
    );
  } catch (error) {
    const isAuthError = error instanceof OpenAI.APIError && (error.status === 401 || error.status === 403);
    throw new OpenAIChatError(isAuthError ? "auth" : "unavailable");
  }

  const iterator = completion[Symbol.asyncIterator]();
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await iterator.next();
        if (done) {
          controller.close();
          return;
        }
        const text = value.choices[0]?.delta?.content;
        if (typeof text === "string" && text.length > 0) controller.enqueue(encoder.encode(text));
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel() {
      await iterator.return?.();
    },
  });

  return { stream };
}
