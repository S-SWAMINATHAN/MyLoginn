import OpenAI from "openai";

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export function isGroqConfigured() {
  return Boolean(process.env.GROQ_API_KEY);
}

export class GroqChatError extends Error {
  constructor(public kind: "auth" | "unavailable") {
    super(`Groq ${kind}`);
  }
}

export type GroqTurn = { role: "user" | "assistant"; content: string };

/** Streams Groq's OpenAI-compatible chat completion API as plain-text deltas. */
export async function streamGroqReply(
  systemPrompt: string,
  turns: GroqTurn[],
  signal?: AbortSignal
): Promise<{ stream: ReadableStream<Uint8Array> }> {
  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
  let completion: Awaited<ReturnType<typeof client.chat.completions.create>>;

  try {
    completion = await client.chat.completions.create(
      {
        model: process.env.GROQ_MODEL || DEFAULT_MODEL,
        messages: [{ role: "system", content: systemPrompt }, ...turns],
        max_completion_tokens: 1024,
        stream: true,
      },
      { signal }
    );
  } catch (error) {
    if (signal?.aborted) throw error;
    const isAuthError = error instanceof OpenAI.APIError && (error.status === 401 || error.status === 403);
    throw new GroqChatError(isAuthError ? "auth" : "unavailable");
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
