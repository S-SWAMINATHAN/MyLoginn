/** Shared shapes for the certificate studio (server page → client flow → templates). All dates cross the wire as ISO strings. */

export type TemplateId = "modern-executive" | "tech-vanguard" | "classic-heritage" | "ocean-wave" | "bold-geometric";

export type UserData = {
  id: string;
  /** Profile/display name. Only a suggestion: the printed name is the one the learner confirms. */
  displayName: string;
  email: string;
};

export type AssessmentResult = {
  courseSlug: string;
  courseTitle: string;
  /** Best submitted final-assessment score, or null when the learner has not taken it yet. */
  bestPercent: number | null;
  passPercent: number;
  attemptsUsed: number;
  /** Null means unlimited attempts. */
  maxAttempts: number | null;
  scorePassed: boolean;
  /** Score passed AND every other course requirement (lessons, projects) is met, per the server. */
  certificateEligible: boolean;
  /** Server explanation of what is still missing; null when eligible. */
  lockReason: string | null;
  retakeHref: string;
};

/** A certificate already recorded on the server. `nameConfirmed` means the printed name is locked. */
export type IssuedCertificate = {
  credentialId: string;
  learnerName: string;
  nameConfirmed: boolean;
  issuedAt: string;
  finalPercent: number;
};

export type Signatory = { name: string; title?: string };

/** Everything a template needs to draw one certificate. */
export type CertificateData = {
  candidateName: string;
  courseTitle: string;
  /** ISO date; templates print it via formatCertificateDate. */
  completionDate: string;
  credentialId: string;
  signatories: readonly [Signatory, Signatory];
  /** Admin preview: templates show a "sample" mark and the ID is not a real credential. */
  sample?: boolean;
};

export type TemplateProps = { data: CertificateData };

export type TemplateOption = {
  id: TemplateId;
  name: string;
  tagline: string;
  /** Swatches shown on the selector card. */
  palette: readonly string[];
  component: (props: TemplateProps) => React.ReactElement;
};

export type ExportFormat = "pdf" | "png";
