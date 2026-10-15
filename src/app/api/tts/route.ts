import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

// Neural voices that sound like a real presenter. The client may only pick from this list.
const VOICES = new Set(["en-US-AvaMultilingualNeural", "en-US-EmmaMultilingualNeural", "en-US-AriaNeural", "en-US-JennyNeural", "en-US-GuyNeural", "en-IN-NeerjaNeural", "en-IN-PrabhatNeural", "en-GB-SoniaNeural"]);
const MAX_CHARS = 700;

// In-memory cache so repeated plays of the same line do not hit the speech service again.
const cache = new Map<string, Buffer>();

function collect(stream: NodeJS.ReadableStream) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("close", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

export async function GET(request: NextRequest) {
  const text = (request.nextUrl.searchParams.get("t") ?? "").replace(/\s+/g, " ").trim();
  const voice = request.nextUrl.searchParams.get("v") ?? "en-US-AvaMultilingualNeural";
  if (!text || text.length > MAX_CHARS || !VOICES.has(voice)) return Response.json({ error: "Invalid text or voice." }, { status: 400 });

  const key = `${voice}|${text}`;
  let audio = cache.get(key);
  if (!audio) {
    const tts = new MsEdgeTTS();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      // Never let a stalled speech socket hang the request: the player falls back to the browser voice on error.
      const timeout = new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("timeout")), 15000); });
      audio = await Promise.race([(async () => {
        await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
        const { audioStream } = tts.toStream(text);
        return collect(audioStream);
      })(), timeout]);
    } catch {
      return Response.json({ error: "Voice service unavailable." }, { status: 502 });
    } finally {
      clearTimeout(timer);
      try { tts.close(); } catch { /* socket already closed */ }
    }
    if (!audio.length) return Response.json({ error: "No audio produced." }, { status: 502 });
    if (cache.size > 400) cache.clear();
    cache.set(key, audio);
  }

  return new Response(new Uint8Array(audio), {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
