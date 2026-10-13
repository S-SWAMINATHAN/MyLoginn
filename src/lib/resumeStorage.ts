import path from "path";

/** Resumes live outside `public/`, so they are never served by URL; only the admin download route can read them. */
export const RESUME_DIR = path.join(process.cwd(), "private-uploads", "resumes");
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export const RESUME_TYPES: Record<string, { mime: string; label: string }> = {
  ".pdf": { mime: "application/pdf", label: "PDF" },
  ".doc": { mime: "application/msword", label: "DOC" },
  ".docx": { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", label: "DOCX" },
};

export function resumeExtension(filename: string): string | null {
  const ext = path.extname(filename).toLowerCase();
  return ext in RESUME_TYPES ? ext : null;
}

/** Confirms the file's leading bytes match the claimed type, so a renamed executable or script is rejected. */
export function matchesResumeSignature(ext: string, buffer: Buffer): boolean {
  if (ext === ".pdf") return buffer.length >= 5 && buffer.toString("ascii", 0, 5) === "%PDF-";
  if (ext === ".docx") return buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
  if (ext === ".doc") return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
  return false;
}

/** A safe display name: no path parts or control characters, capped in length. */
export function cleanResumeName(name: string): string {
  const base = path.basename(name).replace(/[^\w.\- ()]+/g, "_").trim();
  return base.slice(0, 120) || "resume";
}

export function resumeFilePath(applicationId: string, ext: string) {
  return path.join(RESUME_DIR, `${applicationId}${ext}`);
}
