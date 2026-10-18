/** Group discussion options, shared by the create form and the server. */

export const GD_LIMITS = {
  minParticipants: 2,
  maxParticipants: 6,
  defaultParticipants: 5,
  prepS: { min: 0, max: 300, default: 120 },
  discussS: { min: 300, max: 2400, default: 1800 },
};

/** A participant whose last poll is older than this is shown as offline. */
export const GD_ONLINE_MS = 15_000;
/** Longest speech segment a browser uploads; longer turns are split. */
export const GD_SEGMENT_MAX_MS = 40_000;
/** Silence that ends a speech segment. */
export const GD_SEGMENT_GAP_MS = 1_200;
/** After the discussion ends, how long the judge waits for final segments. */
export const GD_FLUSH_GRACE_MS = 15_000;
export const GD_FLUSH_MAX_MS = 75_000;

export const GD_CATEGORIES: { id: string; label: string; topics: string[] }[] = [
  { id: "technology", label: "Technology", topics: ["Is AI replacing human jobs?", "Does coding matter for every IT job?", "Is cybersecurity everyone's responsibility?", "Are low-code tools the future of software development?", "Should data privacy be a fundamental right?"] },
  { id: "ai", label: "AI", topics: ["Should college students learn AI?", "Can AI be trusted to make hiring decisions?", "Should AI-generated content always be labelled?", "Will AI make programmers more productive or less needed?", "Should AI tools be allowed in exams and assignments?"] },
  { id: "education", label: "Education", topics: ["Are degrees still important in the IT industry?", "Online learning vs classroom learning", "Should internships be compulsory for graduation?", "Is the Indian education system preparing students for jobs?", "Skills or marks: which matters more for placements?"] },
  { id: "business", label: "Business", topics: ["Startups vs MNCs: where should a fresher begin?", "Is the gig economy good for young professionals?", "Should companies prioritise profit or sustainability?", "Is brand value more important than product quality?", "Can India become the world's technology hub?"] },
  { id: "society", label: "Society", topics: ["Is social media beneficial for students?", "Is digital India leaving rural India behind?", "Should screen time be regulated for children?", "Does the four-day work week make sense for India?", "Influencers: role models or marketing tools?"] },
  { id: "environment", label: "Environment", topics: ["Can technology solve climate change?", "Should electric vehicles be made mandatory?", "Is development more important than the environment?", "Should single-use plastics be banned completely?", "Remote work: a solution for city pollution?"] },
  { id: "workplace", label: "Workplace", topics: ["Work from home vs office", "Is job hopping good for your career?", "Should salaries be transparent in a company?", "Are long working hours a sign of commitment?", "Hard work vs smart work"] },
  { id: "abstract", label: "General / Abstract", topics: ["Failure is the stepping stone to success", "Change is the only constant", "Leaders are born, not made", "The pen is mightier than the sword", "Is competition healthy?"] },
];

export const GD_DIMENSIONS = [
  { key: "communication", label: "Communication" },
  { key: "fluency", label: "Fluency" },
  { key: "grammar", label: "Grammar" },
  { key: "vocabulary", label: "Vocabulary" },
  { key: "clarity", label: "Clarity" },
  { key: "confidence", label: "Confidence" },
  { key: "listening", label: "Listening" },
  { key: "teamwork", label: "Teamwork" },
  { key: "leadership", label: "Leadership" },
  { key: "logic", label: "Logical Thinking" },
  { key: "knowledge", label: "Topic Knowledge" },
  { key: "professionalism", label: "Professional Behaviour" },
] as const;

export const isRoomCode = (code: string) => /^ML-GD-[A-Z2-9]{4}$/.test(code);
export const normalizeRoomCode = (input: string) => {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const tail = raw.startsWith("MLGD") ? raw.slice(4) : raw;
  return tail.length === 4 ? `ML-GD-${tail}` : input.toUpperCase().trim();
};

export type GdPublicRoom = {
  code: string;
  topic: string;
  category: string;
  status: string;
  hostId: string;
  maxParticipants: number;
  prepS: number;
  discussS: number;
  prepAt: number | null;
  liveAt: number | null;
  endsAt: number | null;
};

export type GdPublicParticipant = { userId: string; name: string; avatarColor: string; avatarUrl: string | null; peerId: string; muted: boolean; online: boolean; left: boolean };
export type GdSignalOut = { id: number; from: string; kind: string; payload: unknown };
export type GdSync = { room: GdPublicRoom; participants: GdPublicParticipant[]; signals: GdSignalOut[]; serverNow: number; me: { userId: string; isHost: boolean } };

/** The phase everyone sees, derived from the stored times so all clients agree without extra writes. */
export function gdPhase(room: Pick<GdPublicRoom, "status" | "liveAt" | "endsAt">, now: number) {
  if (room.status === "LOBBY" || room.status === "CANCELLED" || room.status === "DONE" || room.status === "JUDGING") return room.status;
  if (room.status === "EVALUATING") return "EVALUATING";
  if (room.liveAt && now < room.liveAt) return "PREP";
  if (room.endsAt && now >= room.endsAt) return "EVALUATING";
  return "LIVE";
}
