"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import db from "@/db";
import { debts } from "@/db/schema";
import { getSession, getEncryptionKey } from "@/lib/auth";
import { encrypt, encryptField, decryptDebt } from "@/lib/encryption";

export type DebtType = "LEND" | "BORROW";

export interface DebtFormData {
  personName: string;
  amount: string;
  type: DebtType;
  description?: string;
  dueDate?: Date;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Get all debts
 */
export async function getDebts() {
  const session = await getSession();
  if (!session) return [];

  const key = await getEncryptionKey();

  const raw = await db.query.debts.findMany({
    where: eq(debts.userId, session.userId),
    orderBy: (debts, { desc }) => [desc(debts.createdAt)],
  });

  if (!key) return raw;
  return Promise.all(raw.map((d) => decryptDebt(d, key)));
}

/**
 * Create debt/receivable
 */
export async function createDebt(data: DebtFormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const key = await getEncryptionKey();

    await db.insert(debts).values({
      userId: session.userId,
      personName: key
        ? await encrypt(data.personName, key)
        : data.personName,
      amount: key ? await encrypt(data.amount, key) : data.amount,
      remainingAmount: key
        ? await encrypt(data.amount, key)
        : data.amount,
      type: data.type,
      description: key
        ? await encryptField(data.description ?? null, key)
        : (data.description ?? null),
      dueDate: data.dueDate,
      isPaid: false,
    });

    revalidatePath("/dashboard/debts");
    return { success: true };
  } catch (error) {
    console.error("Create debt error:", error);
    return { success: false, error: "Gagal membuat catatan" };
  }
}

/**
 * Mark as paid
 */
export async function markDebtAsPaid(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const key = await getEncryptionKey();

    await db
      .update(debts)
      .set({
        isPaid: true,
        remainingAmount: key ? await encrypt("0", key) : "0",
        updatedAt: new Date(),
      })
      .where(and(eq(debts.id, id), eq(debts.userId, session.userId)));

    revalidatePath("/dashboard/debts");
    return { success: true };
  } catch (error) {
    console.error("Mark paid error:", error);
    return { success: false, error: "Gagal mengupdate status" };
  }
}

/**
 * Delete debt
 */
export async function deleteDebt(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db
      .delete(debts)
      .where(and(eq(debts.id, id), eq(debts.userId, session.userId)));

    revalidatePath("/dashboard/debts");
    return { success: true };
  } catch (error) {
    console.error("Delete debt error:", error);
    return { success: false, error: "Gagal menghapus" };
  }
}
