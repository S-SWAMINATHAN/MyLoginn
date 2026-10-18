import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "./prisma";
import { getRequiredServerEnv } from "./env";
const COOKIE_NAME = "myloginn_session";

export type SessionPayload = {
  userId: string;
  role: "STUDENT" | "MENTOR" | "ADMIN";
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, getRequiredServerEnv("JWT_SECRET"), { expiresIn: "30d" });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, getRequiredServerEnv("JWT_SECRET")) as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = signSession(payload);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/**
 * The signed-in user. Memoised per request: the root layout and the page both ask for it, and without this every
 * page view ran the same user query twice.
 */
export const getCurrentUser = cache(async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifySession(token);
  if (!payload) return null;
  try {
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    return user ?? null;
  } catch (error) {
    // A database outage must not crash every page that reads the session.
    console.error("getCurrentUser: database unreachable", error);
    return null;
  }
});

/**
 * The signed-in user's id from the session cookie alone, without a database lookup. For high-frequency endpoints
 * (group-discussion polling) that check membership themselves.
 */
export async function getSessionUserId() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return token ? verifySession(token)?.userId ?? null : null;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}
