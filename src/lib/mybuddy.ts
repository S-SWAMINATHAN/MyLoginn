/**
 * Minimal client for the self-hosted MyBuddy backend (https://github.com/S-SWAMINATHAN/MyBuddy).
 * The site signs in once with a service account and runs each chat request in a throwaway
 * MyBuddy conversation, which is deleted when the reply finishes.
 */

const baseUrl = () => (process.env.MYBUDDY_API_URL || "").replace(/\/+$/, "");

export function isMyBuddyConfigured() {
  return Boolean(baseUrl() && process.env.MYBUDDY_EMAIL && process.env.MYBUDDY_PASSWORD);
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function login(): Promise<string> {
  const res = await fetch(`${baseUrl()}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: process.env.MYBUDDY_EMAIL, password: process.env.MYBUDDY_PASSWORD }),
  });
  if (!res.ok) throw new MyBuddyError(res.status === 401 ? "auth" : "unavailable");
  const { access_token } = (await res.json()) as { access_token: string };
  // MyBuddy access tokens default to 30 min; refresh a little early.
  cachedToken = { value: access_token, expiresAt: Date.now() + 20 * 60_000 };
  return access_token;
}

async function getToken(force = false) {
  if (!force && cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;
  return login();
}

export class MyBuddyError extends Error {
  constructor(public kind: "auth" | "unavailable") {
    super(`MyBuddy ${kind}`);
  }
}

async function authed(path: string, init: RequestInit, signal?: AbortSignal): Promise<Response> {
  const run = async (token: string) =>
    fetch(`${baseUrl()}/api/v1${path}`, {
      ...init,
      signal,
      headers: { ...init.headers, "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
  let res = await run(await getToken());
  if (res.status === 401) res = await run(await getToken(true));
  return res;
}

/** Streams the assistant's reply text for `content`, using `systemPrompt` as the conversation's instructions. */
export async function streamMyBuddyReply(
  systemPrompt: string,
  content: string,
  signal?: AbortSignal
): Promise<{ stream: ReadableStream<Uint8Array>; cleanup: () => Promise<void> }> {
  let created: Response;
  try {
    created = await authed(
      "/conversations",
      {
        method: "POST",
        body: JSON.stringify({ title: "Website chat", system_prompt: systemPrompt, tools_enabled: false }),
      },
      signal
    );
  } catch (e) {
    if (e instanceof MyBuddyError) throw e;
    throw new MyBuddyError("unavailable");
  }
  if (!created.ok) throw new MyBuddyError("unavailable");
  const { id } = (await created.json()) as { id: string };

  const cleanup = async () => {
    try {
      await authed(`/conversations/${id}`, { method: "DELETE" });
    } catch {
      /* best-effort */
    }
  };

  let res: Response;
  try {
    res = await authed(`/conversations/${id}/messages`, { method: "POST", body: JSON.stringify({ content }) }, signal);
  } catch {
    await cleanup();
    throw new MyBuddyError("unavailable");
  }
  if (!res.ok || !res.body) {
    await cleanup();
    throw new MyBuddyError("unavailable");
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = res.body.getReader();
  let buffer = "";

  // Convert MyBuddy's SSE ("data: {"delta": ...}") into plain text deltas for the widget.
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          await cleanup();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const event of events) {
          const line = event.split("\n").find((l) => l.startsWith("data:"));
          if (!line) continue;
          try {
            const data = JSON.parse(line.slice(5).trim()) as { delta?: string; error?: string };
            if (data.error) throw new Error(data.error);
            if (data.delta) controller.enqueue(encoder.encode(data.delta));
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      } catch (e) {
        controller.error(e);
        await cleanup();
      }
    },
    async cancel() {
      await reader.cancel().catch(() => {});
      await cleanup();
    },
  });

  return { stream, cleanup };
}
