"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import db from "@/db";
import { recurringTransactions } from "@/db/schema";
import { getSession, getEncryptionKey } from "@/lib/auth";
import { encrypt, decryptRecurring } from "@/lib/encryption";

export type RecurringFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface RecurringFormData {
  accountId: string;
  categoryId?: string;
  amount: string;
  type: "INCOME" | "EXPENSE";
  description: string;
  frequency: RecurringFrequency;
  startDate: Date;
  nextDueDate: Date;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Get all recurring transactions
 */
export async function getRecurringTransactions() {
  const session = await getSession();
  if (!session) return [];

  const key = await getEncryptionKey();

  const raw = await db.query.recurringTransactions.findMany({
    where: eq(recurringTransactions.userId, session.userId),
    with: {
      account: true,
      category: true,
    },
    orderBy: (r, { asc }) => [asc(r.nextDueDate)],
  });

  if (!key) return raw;
  return Promise.all(raw.map((r) => decryptRecurring(r, key)));
}

/**
 * Create recurring transaction
 */
export async function createRecurring(
  data: RecurringFormData,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const key = await getEncryptionKey();

    await db.insert(recurringTransactions).values({
      userId: session.userId,
      accountId: data.accountId,
      categoryId: data.categoryId || null,
      amount: key ? await encrypt(data.amount, key) : data.amount,
      type: data.type,
      description: key
        ? await encrypt(data.description, key)
        : data.description,
      frequency: data.frequency,
      startDate: data.startDate,
      nextDueDate: data.nextDueDate,
      isActive: true,
    });

    revalidatePath("/dashboard/recurring");
    return { success: true };
  } catch (error) {
    console.error("Create recurring error:", error);
    return { success: false, error: "Gagal membuat transaksi berulang" };
  }
}

/**
 * Toggle recurring active status
 */
export async function toggleRecurringStatus(
  id: string,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const existing = await db.query.recurringTransactions.findFirst({
      where: and(
        eq(recurringTransactions.id, id),
        eq(recurringTransactions.userId, session.userId),
      ),
    });

    if (!existing) {
      return { success: false, error: "Tidak ditemukan" };
    }

    await db
      .update(recurringTransactions)
      .set({
        isActive: !existing.isActive,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(recurringTransactions.id, id),
          eq(recurringTransactions.userId, session.userId),
        ),
      );

    revalidatePath("/dashboard/recurring");
    return { success: true };
  } catch (error) {
    console.error("Toggle recurring error:", error);
    return { success: false, error: "Gagal mengubah status" };
  }
}

/**
 * Delete recurring transaction
 */
export async function deleteRecurring(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db
      .delete(recurringTransactions)
      .where(
        and(
          eq(recurringTransactions.id, id),
          eq(recurringTransactions.userId, session.userId),
        ),
      );

    revalidatePath("/dashboard/recurring");
    return { success: true };
  } catch (error) {
    console.error("Delete recurring error:", error);
    return { success: false, error: "Gagal menghapus" };
  }
}
