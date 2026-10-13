/**
 * Minimal Gemini client (REST, streaming) used by the website chatbot.
 * Server-only: the API key comes from GEMINI_API_KEY and is never sent to the browser.
 */

const DEFAULT_MODEL = "gemini-3.8-flash";

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export class GeminiError extends Error {
  constructor(public kind: "auth" | "unavailable") {
    super(`Gemini ${kind}`);
  }
}

export type GeminiTurn = { role: "user" | "assistant"; content: string };

/** Streams the assistant's reply as plain-text deltas. */
export async function streamGeminiReply(
  systemPrompt: string,
  turns: GeminiTurn[],
  signal?: AbortSignal
): Promise<{ stream: ReadableStream<Uint8Array> }> {
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
      {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: turns.map((t) => ({
            role: t.role === "assistant" ? "model" : "user",
            parts: [{ text: t.content }],
          })),
          generationConfig: { temperature: 0.5, maxOutputTokens: 1024, thinkingConfig: { thinkingBudget: 0 } },
        }),
      }
    );
  } catch {
    throw new GeminiError("unavailable");
  }
  if (res.status === 400 || res.status === 401 || res.status === 403) {
    console.error("Gemini rejected request:", res.status, await res.text().catch(() => ""));
    throw new GeminiError(res.status === 400 ? "unavailable" : "auth");
  }
  if (!res.ok || !res.body) throw new GeminiError("unavailable");

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = res.body.getReader();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() ?? "";
        for (const event of events) {
          const line = event.split(/\r?\n/).find((l) => l.startsWith("data:"));
          if (!line) continue;
          try {
            const data = JSON.parse(line.slice(5).trim()) as {
              candidates?: { content?: { parts?: { text?: string }[] } }[];
            };
            const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("");
            if (text) controller.enqueue(encoder.encode(text));
          } catch {
            /* skip malformed chunk */
          }
        }
      } catch (e) {
        controller.error(e);
      }
    },
    async cancel() {
      await reader.cancel().catch(() => {});
    },
  });

  return { stream };
}
