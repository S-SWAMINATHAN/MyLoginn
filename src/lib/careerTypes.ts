import type { ApplicationSource, JobStatus } from "@/lib/jobs";

/** Row shapes returned by the admin Careers APIs, shared by the routes and the admin screens. */
export type JobRow = {
  id: string;
  slug: string;
  title: string;
  team: string;
  type: string;
  location: string;
  experience: string | null;
  salaryRange: string | null;
  positions: number;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  status: string;
  openFrom: string | null;
  closeBy: string | null;
  createdAt: string;
  updatedAt: string;
  /** The status the public currently sees (dates move a role from upcoming to open to closed on their own). */
  effective: JobStatus;
  applications: number;
  newApplications: number;
};

export type InternshipRow = {
  id: string;
  slug: string;
  title: string;
  company: string;
  type: string;
  location: string;
  durationWeeks: number;
  paid: boolean;
  featured: boolean;
  applyDeadline: string;
  open: boolean;
  applications: number;
  newApplications: number;
};

export type ApplicationRow = {
  source: ApplicationSource;
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  jobId: string | null;
  status: string;
  rating: number | null;
  notes: string | null;
  coverNote: string | null;
  experienceYears: number | null;
  currentRole: string | null;
  profileUrl: string | null;
  resumeName: string | null;
  resumeType: "pdf" | "doc" | "docx" | null;
  appliedAt: string;
  reviewedAt: string | null;
  unreviewed: boolean;
};

export type ApplicationsResponse = { rows: ApplicationRow[]; counts: { all: number; job: number; internship: number; unreviewed: number } };
