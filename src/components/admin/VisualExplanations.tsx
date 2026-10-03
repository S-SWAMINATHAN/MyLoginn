"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, LoaderCircle, Play, Sparkles } from "lucide-react";

type Course = { id: string; title: string };
type Scene = { heading: string; caption: string; visual: "concept" | "flow" | "code" | "result"; code?: string };
type Explanation = { id: string; courseId: string; topic: string; summary: string; scenes: Scene[]; course: { title: string } };

const colors = { blue: "#2563eb", ink: "#172554", muted: "#64748b", pale: "#eff6ff", line: "#bfdbfe", green: "#16a34a" };

export function VisualExplanations() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [items, setItems] = useState<Explanation[]>([]);
  const [courseId, setCourseId] = useState("");
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [selected, setSelected] = useState<Explanation | null>(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/visual-explanations", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load visual explanations.");
    const data = await response.json();
    setCourses(data.courses);
    setCourseId((current) => current || data.courses[0]?.id || "");
    setItems(data.explanations);
    setSelected((current) => current ? data.explanations.find((item: Explanation) => item.id === current.id) ?? current : data.explanations[0] ?? null);
  }, []);

  useEffect(() => { void load().catch((e: Error) => setError(e.message)); }, [load]);
  useEffect(() => { setSceneIndex(0); }, [selected?.id]);

  const paint = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !selected) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const scene = selected.scenes[index];
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = "#f8fbff"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = colors.blue; ctx.fillRect(0, 0, w, 14);
    ctx.fillStyle = colors.ink; ctx.font = "700 34px Arial"; ctx.fillText(scene.heading, 52, 82, w - 104);
    ctx.fillStyle = colors.muted; ctx.font = "22px Arial"; ctx.fillText(scene.caption, 52, 126, w - 104);
    const box = (x: number, y: number, bw: number, bh: number, label: string, fill = colors.pale) => {
      ctx.fillStyle = fill; ctx.strokeStyle = colors.line; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(x, y, bw, bh, 20); ctx.fill(); ctx.stroke();
      ctx.fillStyle = colors.ink; ctx.font = "600 23px Arial"; ctx.textAlign = "center"; ctx.fillText(label, x + bw / 2, y + bh / 2 + 8, bw - 24); ctx.textAlign = "left";
    };
    if (scene.visual === "code") {
      box(52, 184, w - 104, 206, scene.code || "Follow each instruction in order", "#eff6ff");
      ctx.font = "20px monospace"; ctx.fillStyle = colors.blue;
      (scene.code || "# See the idea in a tiny example").split("\n").slice(0, 4).forEach((line, i) => ctx.fillText(line, 82, 238 + i * 42, w - 164));
    } else if (scene.visual === "flow") {
      box(52, 230, 205, 90, "Input / condition");
      ctx.strokeStyle = colors.blue; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(258, 275); ctx.lineTo(380, 275); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(365, 262); ctx.lineTo(382, 275); ctx.lineTo(365, 288); ctx.stroke();
      box(382, 230, 205, 90, "Check and act", "#f0fdf4");
      ctx.fillStyle = colors.green; ctx.font = "600 19px Arial"; ctx.textAlign = "center"; ctx.fillText("step by step", w / 2, 366); ctx.textAlign = "left";
    } else {
      const labels = scene.visual === "result" ? ["Start", "Process", "Result"] : ["Name", "Value", "Meaning"];
      const values = scene.visual === "result" ? ["Input", "Work", "Output"] : [selected.topic, "A clear example", "Core idea"];
      labels.forEach((label, i) => {
        const x = 52 + i * 202;
        ctx.fillStyle = colors.muted; ctx.font = "600 17px Arial"; ctx.fillText(label.toUpperCase(), x, 220);
        box(x, 240, 174, 92, values[i], i === 2 ? "#f0fdf4" : colors.pale);
        if (i < 2) { ctx.strokeStyle = colors.blue; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 176, 286); ctx.lineTo(x + 197, 286); ctx.stroke(); }
      });
    }
    ctx.fillStyle = colors.muted; ctx.font = "15px Arial"; ctx.fillText("MYLOGINN  •  VISUAL EXPLANATION", 52, h - 24);
    ctx.fillStyle = "#dbeafe"; ctx.fillRect(52, h - 12, w - 104, 4);
    ctx.fillStyle = colors.blue; ctx.fillRect(52, h - 12, (w - 104) * ((index + 1) / selected.scenes.length), 4);
  }, [selected]);

  useEffect(() => { paint(sceneIndex); }, [paint, sceneIndex]);

  async function generate(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/visual-explanations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId, topic, context }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed.");
      setItems((previous) => [data.explanation, ...previous]); setSelected(data.explanation); setTopic("");
    } catch (e) { setError(e instanceof Error ? e.message : "Generation failed."); }
    finally { setBusy(false); }
  }

  async function exportVideo() {
    const canvas = canvasRef.current;
    if (!canvas || !selected) return;
    if (!window.MediaRecorder || !canvas.captureStream) { setError("This browser cannot export the animation as video."); return; }
    setExporting(true); setError("");
    try {
      const stream = canvas.captureStream(30);
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      const finished = new Promise<Blob>((resolve) => { recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" })); });
      recorder.start();
      for (let i = 0; i < selected.scenes.length; i++) {
        setSceneIndex(i); paint(i); await new Promise((resolve) => setTimeout(resolve, 1600));
      }
      recorder.stop();
      const blob = await finished;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${selected.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-explanation.webm`; anchor.click();
      URL.revokeObjectURL(url); stream.getTracks().forEach((track) => track.stop());
    } catch { setError("Video export failed. Please try again in a supported browser."); }
    finally { setExporting(false); }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-start gap-3">
        <span className="rounded-2xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-900/25"><Sparkles className="h-6 w-6" /></span>
        <div><h2 className="text-2xl font-bold">Auto-create explanation videos</h2><p className="mt-1 max-w-2xl text-sm text-muted">Create a short visual storyboard from a lesson topic, preview it, then export it as a shareable WebM video.</p></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
        <form onSubmit={generate} className="h-fit rounded-2xl border border-border-soft bg-surface p-5">
          <h3 className="mb-4 font-semibold">New explanation</h3>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="visual-course">Course</label>
          <select id="visual-course" required value={courseId} onChange={(e) => setCourseId(e.target.value)} className="mb-4 w-full rounded-xl border border-border-soft bg-background px-3 py-2.5 text-sm">
            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="visual-topic">Topic</label>
          <input id="visual-topic" required minLength={2} maxLength={100} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. How a for loop works" className="mb-4 w-full rounded-xl border border-border-soft bg-background px-3 py-2.5 text-sm" />
          <label className="mb-1.5 block text-sm font-medium" htmlFor="visual-context">Lesson notes <span className="font-normal text-muted">(optional)</span></label>
          <textarea id="visual-context" maxLength={1200} rows={4} value={context} onChange={(e) => setContext(e.target.value)} placeholder="Key details or a short code example to include" className="mb-4 w-full resize-y rounded-xl border border-border-soft bg-background px-3 py-2.5 text-sm" />
          <button disabled={busy || !courses.length || !topic.trim()} className="flex w-full items-center justify-center gap-2 rounded-xl brand-gradient-bg px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55">
            {busy ? <><LoaderCircle className="h-4 w-4 animate-spin" />Creating storyboard…</> : <><Sparkles className="h-4 w-4" />Generate explanation</>}
          </button>
          {!courses.length && <p className="mt-3 text-xs text-muted">Create a course first to generate its visual lesson.</p>}
        </form>

        <section className="min-w-0 rounded-2xl border border-border-soft bg-surface p-4 sm:p-5">
          {selected ? <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0"><p className="truncate text-xs font-medium text-brand-600">{selected.course.title}</p><h3 className="truncate font-semibold">{selected.topic}</h3></div>
              <button onClick={exportVideo} disabled={exporting} className="inline-flex items-center gap-2 rounded-xl border border-border-soft px-3 py-2 text-sm font-medium hover:bg-surface-2 disabled:opacity-60">
                {exporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}{exporting ? "Recording…" : "Export video"}
              </button>
            </div>
            <canvas ref={canvasRef} width={640} height={400} className="aspect-[8/5] w-full rounded-xl border border-border-soft bg-[#f8fbff]" aria-label={`Animated visual explanation: ${selected.topic}`} />
            <div className="mt-3 flex items-center gap-2">
              <button aria-label="Play next scene" onClick={() => setSceneIndex((current) => (current + 1) % selected.scenes.length)} className="rounded-full bg-brand-50 p-2 text-brand-700 dark:bg-brand-900/25"><Play className="h-4 w-4" /></button>
              <div className="flex flex-1 gap-1.5">{selected.scenes.map((scene, index) => <button key={`${scene.heading}-${index}`} onClick={() => setSceneIndex(index)} aria-label={`Show scene ${index + 1}: ${scene.heading}`} className={`h-1.5 flex-1 rounded-full ${index === sceneIndex ? "bg-brand-500" : "bg-surface-2"}`} />)}</div>
              <span className="text-xs tabular-nums text-muted">{sceneIndex + 1} / {selected.scenes.length}</span>
            </div>
            <p className="mt-3 text-sm text-muted">{selected.summary}</p>
          </> : <div className="flex min-h-72 items-center justify-center text-center text-sm text-muted">Generate an explanation to preview it here.</div>}
        </section>
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}
      {items.length > 0 && <section className="mt-8"><h3 className="mb-3 font-semibold">Saved explanations</h3><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <button key={item.id} onClick={() => setSelected(item)} className={`rounded-xl border p-3 text-left transition-colors ${selected?.id === item.id ? "border-brand-400 bg-brand-50/60 dark:bg-brand-900/15" : "border-border-soft bg-surface hover:bg-surface-2"}`}><span className="block truncate text-sm font-medium">{item.topic}</span><span className="mt-1 block truncate text-xs text-muted">{item.course.title}</span></button>)}</div></section>}
    </div>
  );
}
