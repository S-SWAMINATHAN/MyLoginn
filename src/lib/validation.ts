import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const phoneSchema = z
  .string()
  .min(8, "Enter a valid phone number")
  .refine((val) => isValidPhoneNumber(val), {
    message: "Enter a valid phone number with country code, e.g. +91 98765 43210",
  });

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[0-9]/, "Include at least one number");

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name"),
    email: emailSchema,
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
  name: z.string().trim().min(2, "Enter your full name"),
  email: emailSchema,
  phone: phoneSchema,
  company: z.string().trim().optional().or(z.literal("")),
  service: z.string().min(1, "Select a service"),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
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
