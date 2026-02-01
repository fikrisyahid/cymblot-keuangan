"use server";

import { revalidatePath } from "next/cache";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import db from "@/db";
import { transactions, accounts } from "@/db/schema";
import { getSession } from "@/lib/auth";

export type TransactionType = "INCOME" | "EXPENSE";

export interface TransactionFormData {
  accountId: string;
  categoryId?: string;
  amount: string;
  type: TransactionType;
  description: string;
  note?: string;
  date: Date;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  type?: TransactionType;
  accountId?: string;
  categoryId?: string;
}

/**
 * Get transactions with optional filters
 */
export async function getTransactions(filters?: TransactionFilters) {
  const session = await getSession();
  if (!session) return [];

  const conditions = [eq(transactions.userId, session.userId)];

  if (filters?.startDate) {
    conditions.push(gte(transactions.date, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(transactions.date, filters.endDate));
  }
  if (filters?.type) {
    conditions.push(eq(transactions.type, filters.type));
  }
  if (filters?.accountId) {
    conditions.push(eq(transactions.accountId, filters.accountId));
  }
  if (filters?.categoryId) {
    conditions.push(eq(transactions.categoryId, filters.categoryId));
  }

  return db.query.transactions.findMany({
    where: and(...conditions),
    with: {
      account: true,
      category: true,
    },
    orderBy: [desc(transactions.date), desc(transactions.createdAt)],
  });
}

/**
 * Get recent transactions (last 10)
 */
export async function getRecentTransactions(limit = 10) {
  const session = await getSession();
  if (!session) return [];

  return db.query.transactions.findMany({
    where: eq(transactions.userId, session.userId),
    with: {
      account: true,
      category: true,
    },
    orderBy: [desc(transactions.date), desc(transactions.createdAt)],
    limit,
  });
}

/**
 * Get monthly summary (income, expense)
 */
export async function getMonthlySummary(year: number, month: number) {
  const session = await getSession();
  if (!session) return { income: 0, expense: 0 };

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const txns = await db.query.transactions.findMany({
    where: and(
      eq(transactions.userId, session.userId),
      gte(transactions.date, startDate),
      lte(transactions.date, endDate)
    ),
  });

  const income = txns
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const expense = txns
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return { income, expense };
}

/**
 * Create new transaction
 */
export async function createTransaction(
  data: TransactionFormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const amountNum = parseFloat(data.amount);

    // Check if account has sufficient balance for expense transactions
    if (data.type === "EXPENSE") {
      const account = await db.query.accounts.findFirst({
        where: and(
          eq(accounts.id, data.accountId),
          eq(accounts.userId, session.userId)
        ),
      });

      if (!account) {
        return { success: false, error: "Akun tidak ditemukan" };
      }

      const currentBalance = parseFloat(account.balance);
      if (currentBalance < amountNum) {
        return {
          success: false,
          error: `Saldo tidak cukup. Saldo tersedia: ${currentBalance}, diperlukan: ${amountNum}`,
        };
      }
    }

    // Create transaction
    await db.insert(transactions).values({
      userId: session.userId,
      accountId: data.accountId,
      categoryId: data.categoryId || null,
      amount: data.amount,
      type: data.type,
      description: data.description,
      note: data.note,
      date: data.date,
    });

    // Update account balance
    const balanceChange = data.type === "INCOME" ? amountNum : -amountNum;

    await db
      .update(accounts)
      .set({
        balance: sql`${accounts.balance} + ${balanceChange}`,
        updatedAt: new Date(),
      })
      .where(
        and(eq(accounts.id, data.accountId), eq(accounts.userId, session.userId))
      );

    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/accounts");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Create transaction error:", error);
    return { success: false, error: "Gagal membuat transaksi" };
  }
}

/**
 * Update transaction
 */
export async function updateTransaction(
  id: string,
  data: TransactionFormData,
  originalAmount: string,
  originalType: TransactionType,
  originalAccountId: string
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const originalAmountNum = parseFloat(originalAmount);
    const newAmountNum = parseFloat(data.amount);

    // Get current account state before any changes
    const account = await db.query.accounts.findFirst({
      where: and(
        eq(accounts.id, data.accountId),
        eq(accounts.userId, session.userId)
      ),
    });

    if (!account) {
      return { success: false, error: "Akun tidak ditemukan" };
    }

    const currentBalance = parseFloat(account.balance);

    // If changing account, need to handle both accounts
    if (data.accountId !== originalAccountId) {
      const originalAccount = await db.query.accounts.findFirst({
        where: and(
          eq(accounts.id, originalAccountId),
          eq(accounts.userId, session.userId)
        ),
      });

      if (!originalAccount) {
        return { success: false, error: "Akun original tidak ditemukan" };
      }

      // Check if new account has sufficient balance for expense transactions
      if (data.type === "EXPENSE") {
        if (currentBalance < newAmountNum) {
          return {
            success: false,
            error: `Saldo akun ${account.name} tidak cukup. Saldo tersedia: ${currentBalance}, diperlukan: ${newAmountNum}`,
          };
        }
      }

      // Revert from original account
      const originalRevertChange =
        originalType === "INCOME" ? -originalAmountNum : originalAmountNum;

      await db
        .update(accounts)
        .set({
          balance: sql`${accounts.balance} + ${originalRevertChange}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(accounts.id, originalAccountId),
            eq(accounts.userId, session.userId)
          )
        );

      // Apply new transaction to new account
      const newChange = data.type === "INCOME" ? newAmountNum : -newAmountNum;

      await db
        .update(accounts)
        .set({
          balance: sql`${accounts.balance} + ${newChange}`,
          updatedAt: new Date(),
        })
        .where(
          and(eq(accounts.id, data.accountId), eq(accounts.userId, session.userId))
        );
    } else {
      // Same account: calculate balance after reverting original transaction
      const revertChange =
        originalType === "INCOME" ? -originalAmountNum : originalAmountNum;
      const balanceAfterRevert = currentBalance + revertChange;

      // Check if the new transaction is an expense and if there's sufficient balance
      if (data.type === "EXPENSE") {
        if (balanceAfterRevert < newAmountNum) {
          return {
            success: false,
            error: `Saldo tidak cukup. Saldo tersedia setelah revert: ${balanceAfterRevert}, diperlukan: ${newAmountNum}`,
          };
        }
      }

      // Apply new transaction to the reverted balance
      const finalBalance = balanceAfterRevert + (data.type === "INCOME" ? newAmountNum : -newAmountNum);

      await db
        .update(accounts)
        .set({
          balance: finalBalance.toString(),
          updatedAt: new Date(),
        })
        .where(
          and(eq(accounts.id, data.accountId), eq(accounts.userId, session.userId))
        );
    }

    // Update transaction
    await db
      .update(transactions)
      .set({
        accountId: data.accountId,
        categoryId: data.categoryId || null,
        amount: data.amount,
        type: data.type,
        description: data.description,
        note: data.note,
        date: data.date,
        updatedAt: new Date(),
      })
      .where(
        and(eq(transactions.id, id), eq(transactions.userId, session.userId))
      );

    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/accounts");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update transaction error:", error);
    return { success: false, error: "Gagal mengupdate transaksi" };
  }
}

/**
 * Delete transaction
 */
export async function deleteTransaction(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get transaction first to revert balance
    const txn = await db.query.transactions.findFirst({
      where: and(
        eq(transactions.id, id),
        eq(transactions.userId, session.userId)
      ),
    });

    if (!txn) {
      return { success: false, error: "Transaksi tidak ditemukan" };
    }

    // Revert balance
    const amountNum = parseFloat(txn.amount);
    const revertChange = txn.type === "INCOME" ? -amountNum : amountNum;

    await db
      .update(accounts)
      .set({
        balance: sql`${accounts.balance} + ${revertChange}`,
        updatedAt: new Date(),
      })
      .where(
        and(eq(accounts.id, txn.accountId), eq(accounts.userId, session.userId))
      );

    // Delete transaction
    await db
      .delete(transactions)
      .where(
        and(eq(transactions.id, id), eq(transactions.userId, session.userId))
      );

    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/accounts");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete transaction error:", error);
    return { success: false, error: "Gagal menghapus transaksi" };
  }
}
