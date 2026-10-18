"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MicError, Recorder, type MicProblem } from "./recorder";

/**
 * One microphone per practice session: permission is asked once, then reused for every answer. A device that is
 * unplugged (track ended) is reported as `lost` so the UI can offer to reconnect instead of freezing.
 */
export function useMic() {
  const rec = useRef<Recorder | null>(null);
  const [problem, setProblem] = useState<MicProblem | null>(null);
  const [lost, setLost] = useState(false);
  const [ready, setReady] = useState(false);

  const ensure = useCallback(async () => {
    if (rec.current) return rec.current;
    try {
      rec.current = await Recorder.open(() => { setLost(true); setReady(false); rec.current?.close(); rec.current = null; });
      setProblem(null);
      setLost(false);
      setReady(true);
      return rec.current;
    } catch (e) {
      setProblem(e instanceof MicError ? e.problem : "unknown");
      return null;
    }
  }, []);

  // Unplugging the device ends the track (handled above, and reconnecting is a tap, which iOS needs to resume audio).
  useEffect(() => () => { rec.current?.close(); rec.current = null; }, []);

  const getLevel = useCallback(() => rec.current?.level ?? 0, []);
  return { rec, ensure, problem, lost, ready, getLevel };
}

/** Ticks once per `ms` while `active` — for visible timers only (not for logic). */
export function useTicker(active: boolean, ms = 250) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const tick = () => setNow(performance.now() - start);
    // First update right away (async), so a restarted timer never shows the old value for long.
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, ms);
    return () => { clearTimeout(first); clearInterval(id); };
  }, [active, ms]);
  return now;
}
