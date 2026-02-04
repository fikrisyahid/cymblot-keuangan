"use server";

import { eq } from "drizzle-orm";
import db from "@/db";
import { users } from "@/db/schema";
import {
  hashPassword,
  verifyPassword,
  createSession,
  setSessionCookie,
  clearSessionCookie,
  getSession,
} from "@/lib/auth";
import { createDefaultCategories } from "@/lib/categories";

export interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Register a new user
 */
export async function register(formData: FormData): Promise<AuthResult> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    return { success: false, error: "Semua field harus diisi" };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Password tidak cocok" };
  }

  if (password.length < 6) {
    return { success: false, error: "Password minimal 6 karakter" };
  }

  // Check if email already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  if (existingUser) {
    return { success: false, error: "Email sudah terdaftar" };
  }

  // Create user
  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({
      name,
      email: email.toLowerCase(),
      passwordHash,
    })
    .returning();

  // Create default categories for the user
  await createDefaultCategories(user.id);

  // Create session and set cookie
  const token = await createSession(user.id, user.email, user.name);
  await setSessionCookie(token);

  return { success: true };
}

/**
 * Login with email and password
 */
export async function login(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email dan password harus diisi" };
  }

  // Find user using ORM-style query
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  if (!user) {
    return { success: false, error: "Email atau password salah" };
  }

  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { success: false, error: "Email atau password salah" };
  }

  // Create session and set cookie
  const token = await createSession(user.id, user.email, user.name);
  await setSessionCookie(token);

  return { success: true };
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  await clearSessionCookie();
}

/**
 * Change user password
 */
export async function changePassword(formData: FormData): Promise<AuthResult> {
  const session = await getSession();

  if (!session) {
    return { success: false, error: "Anda harus login terlebih dahulu" };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmNewPassword = formData.get("confirmNewPassword") as string;

  // Validation
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return { success: false, error: "Semua field harus diisi" };
  }

  if (newPassword !== confirmNewPassword) {
    return { success: false, error: "Password baru tidak cocok" };
  }

  if (newPassword.length < 6) {
    return { success: false, error: "Password baru minimal 6 karakter" };
  }

  // Get current user
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user) {
    return { success: false, error: "User tidak ditemukan" };
  }

  // Verify current password
  const isValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValid) {
    return { success: false, error: "Password lama salah" };
  }

  // Update password
  const newPasswordHash = await hashPassword(newPassword);
  await db
    .update(users)
    .set({
      passwordHash: newPasswordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.userId));

  return { success: true };
}
