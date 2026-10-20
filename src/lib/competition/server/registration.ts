import "server-only";
import { z } from "zod";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import type { Competition, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { emailSchema, passwordSchema, personNameSchema, phoneSchema } from "@/lib/validation";
import { registrationOpenNow } from "../state";
import type { CompetitionStatus } from "../types";
import { ApiError, isUniqueViolation } from "./http";

export const registerSchema = z
  .object({
    name: personNameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
    acceptRules: z.literal(true, { message: "Accept the competition rules and privacy notice to register" }),
  })
  .refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

/** For a signed-in user: only the phone number and the rules acceptance are needed. */
export const registerExistingSchema = z.object({
  phone: phoneSchema,
  acceptRules: z.literal(true, { message: "Accept the competition rules and privacy notice to register" }),
});

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export function normalizePhone(phone: string) {
  try {
    return parsePhoneNumberWithError(phone).number; // E.164
  } catch {
    throw new ApiError(400, "Enter a valid mobile number with country code.");
  }
}

/** "MLC26-00042": prefix, competition year, zero-padded sequence. Never derived from contact details. */
export const candidateIdFor = (c: Pick<Competition, "candidatePrefix" | "startsAt">, n: number) =>
  `${c.candidatePrefix}${String(c.startsAt.getUTCFullYear()).slice(2)}-${String(n).padStart(5, "0")}`;

function assertOpen(c: Competition) {
  if (!registrationOpenNow(c.status as CompetitionStatus, c, new Date())) throw new ApiError(409, "Registration is not open for this competition.", "REGISTRATION_CLOSED");
}

async function insertRegistration(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  c: Competition,
  user: { id: string; name: string },
  email: string,
  phone: string
) {
  // Row-locked increment: serialises concurrent registrations on the counter, enforces capacity and yields the
  // candidate number. A failure later in the transaction rolls the increment back too.
  const rows = await tx.$queryRaw<{ registrationCount: number }[]>`
    UPDATE "Competition" SET "registrationCount" = "registrationCount" + 1
    WHERE "id" = ${c.id} AND "registrationCount" < "maxParticipants"
    RETURNING "registrationCount"`;
  if (!rows.length) throw new ApiError(409, "This competition is full.", "FULL");
  return tx.ccRegistration.create({
    data: {
      competitionId: c.id,
      userId: user.id,
      candidateId: candidateIdFor(c, rows[0].registrationCount),
      displayName: user.name,
      emailNormalized: email,
      phoneNormalized: phone,
      acceptedRulesAt: new Date(),
    },
  });
}

function duplicate(e: unknown): never {
  if (isUniqueViolation(e, "phoneNormalized")) throw new ApiError(409, "This mobile number is already registered for this competition.", "DUPLICATE_PHONE");
  if (isUniqueViolation(e, "emailNormalized") || isUniqueViolation(e, "userId")) throw new ApiError(409, "You are already registered for this competition.", "ALREADY_REGISTERED");
  if (isUniqueViolation(e, "email")) throw new ApiError(409, "An account with this email already exists. Log in to register with it.", "ACCOUNT_EXISTS");
  throw e;
}

/**
 * New visitor: creates the student account and the registration in one transaction (no OTP, no email
 * verification). An existing email is never silently reused: the visitor is asked to log in instead.
 */
export async function registerNewCandidate(c: Competition, input: z.infer<typeof registerSchema>) {
  assertOpen(c);
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } }))
    throw new ApiError(409, "An account with this email already exists. Log in to register with it.", "ACCOUNT_EXISTS");
  if (await prisma.ccRegistration.findUnique({ where: { competitionId_phoneNormalized: { competitionId: c.id, phoneNormalized: phone } }, select: { id: true } }))
    throw new ApiError(409, "This mobile number is already registered for this competition.", "DUPLICATE_PHONE");
  // Hash before the transaction so the counter row is locked for milliseconds, not for bcrypt's ~100 ms.
  const passwordHash = await hashPassword(input.password);
  const palette = ["#6c4dff", "#06b6d4", "#f97316", "#16a34a", "#e11d48"];
  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name: input.name, email, phone, passwordHash, role: "STUDENT", avatarColor: palette[Math.floor(Math.random() * palette.length)] },
      });
      const registration = await insertRegistration(tx, c, user, email, phone);
      return { user, registration };
    });
  } catch (e) {
    duplicate(e);
  }
}

/** Signed-in student registering with their existing account. */
export async function registerExistingUser(c: Competition, user: User, input: z.infer<typeof registerExistingSchema>) {
  assertOpen(c);
  if (user.role !== "STUDENT") throw new ApiError(403, "Only student accounts can take part in the competition.");
  const phone = normalizePhone(input.phone);
  try {
    return await prisma.$transaction(async (tx) => {
      const registration = await insertRegistration(tx, c, user, normalizeEmail(user.email), phone);
      if (!user.phone) await tx.user.update({ where: { id: user.id }, data: { phone } });
      return { user, registration };
    });
  } catch (e) {
    duplicate(e);
  }
}

export const getRegistration = (competitionId: string, userId: string) =>
  prisma.ccRegistration.findUnique({ where: { competitionId_userId: { competitionId, userId } } });

/** "c•••••@gmail.com" / "+91 •••••• 3210" for authorised displays. */
export const maskEmail = (e: string) => {
  const [local, domain] = e.split("@");
  return `${local.slice(0, 1)}${"•".repeat(Math.max(2, local.length - 1))}@${domain}`;
};
export const maskPhone = (p: string) => `${p.slice(0, 3)} ${"•".repeat(Math.max(4, p.length - 7))} ${p.slice(-4)}`;
