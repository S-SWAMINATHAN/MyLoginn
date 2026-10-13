import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";
import { isDisposableEmail } from "@/lib/emailCheck";

export const phoneSchema = z
  .string()
  .min(8, "Enter a valid phone number")
  .refine((val) => isValidPhoneNumber(val), {
    message: "Enter a valid phone number with country code, e.g. +91 98765 43210",
  });

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address");

// Used wherever we need a real inbox to reply to: rejects throwaway-mail domains.
export const contactEmailSchema = emailSchema.refine((value) => !isDisposableEmail(value), { message: "Please use a permanent email address, not a temporary inbox" });

export const personNameSchema = z.string().trim().min(2, "Enter your full name").max(80, "Name is too long").regex(/^\p{L}[\p{L}\p{M}\s.'-]*$/u, "Use letters only (spaces, dots and hyphens are fine)");

const detailsSchema = z.string().trim().max(1000, "Keep this under 1000 characters").refine((value) => value === "" || value.length >= 10, { message: "Add a few more details (at least 10 characters)" }).optional().or(z.literal(""));

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[0-9]/, "Include at least one number");

export const signupSchema = z
  .object({
    name: personNameSchema,
    email: contactEmailSchema,
    phone: phoneSchema,
    country: z.string().trim().length(2).optional(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
    role: z.enum(["STUDENT", "MENTOR"]).default("STUDENT"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const channelSchema = z.enum(["phone", "email"]);

export const otpRequestSchema = z.object({
  identifier: z.string().min(3),
  purpose: z.enum(["signup", "login", "reset"]),
  channel: channelSchema,
});

export const otpVerifySchema = z.object({
  identifier: z.string().min(3),
  purpose: z.enum(["signup", "login", "reset"]),
  channel: channelSchema,
  code: z.string().length(6),
});

export const leadSchema = z.object({
  name: personNameSchema,
  email: contactEmailSchema,
  phone: phoneSchema,
  company: z.string().trim().max(100, "Company name is too long").optional().or(z.literal("")),
  goals: detailsSchema,
  service: z.string().min(1, "Select a service"),
  message: detailsSchema,
  // Spam trap: real visitors never see or fill this field, and fast submissions are treated as bots.
  website: z.string().max(0).optional(),
  startedAt: z.number().optional(),
});

const optionalText = z.string().trim().max(500).optional().or(z.literal(""));

export const projectRequestSchema = z.object({
  service: z.enum(["web", "mobile", "software", "marketing"]),
  name: personNameSchema,
  company: optionalText,
  email: contactEmailSchema,
  phone: phoneSchema,
  whatsapp: optionalText,
  preferredContact: z.enum(["Phone", "WhatsApp", "Email"]).optional(),
  projectName: optionalText,
  industry: optionalText,
  currentUrl: z.string().trim().url("Enter a valid website URL").optional().or(z.literal("")),
  description: z.string().trim().min(20, "Please provide a little more detail").max(5000),
  objective: optionalText,
  targetAudience: optionalText,
  projectType: optionalText,
  platform: optionalText,
  requirements: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
  budget: optionalText,
  timeline: optionalText,
  additionalNotes: z.string().trim().max(3000).optional().or(z.literal("")),
});

export const internshipApplicationSchema = z.object({
  internshipId: z.string().min(1),
  coverNote: z.string().trim().max(1500).optional().or(z.literal("")),
  resumeName: z.string().trim().optional().or(z.literal("")),
});

export const tutoringBookingSchema = z.object({
  tutorId: z.string().min(1),
  subject: z.string().min(1),
  grade: z.string().min(1),
  board: z.string().min(1),
  preferredSlot: z.string().min(1),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type SignupInput = z.input<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type ProjectRequestInput = z.input<typeof projectRequestSchema>;
