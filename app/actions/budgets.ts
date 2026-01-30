"use server";

import { revalidatePath } from "next/cache";
import { eq, and, gte, lte } from "drizzle-orm";
import db from "@/db";
import { budgets, transactions } from "@/db/schema";
import { getSession } from "@/lib/auth";

export interface BudgetFormData {
  categoryId: string;
  amount: string;
  month: number;
  year: number;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface BudgetWithSpending {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  amount: string;
  spent: number;
  month: number;
  year: number;
}

/**
 * Get budgets with spending calculation
 */
export async function getBudgetsWithSpending(
  month?: number,
  year?: number
): Promise<BudgetWithSpending[]> {
  const session = await getSession();
  if (!session) return [];

  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();

  const userBudgets = await db.query.budgets.findMany({
    where: and(
      eq(budgets.userId, session.userId),
      eq(budgets.month, targetMonth),
      eq(budgets.year, targetYear)
    ),
    with: {
      category: true,
    },
    orderBy: (budgets, { desc }) => [desc(budgets.createdAt)],
  });

  // Calculate date range for this month
  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

  // Calculate spending for each budget
  const budgetsWithSpending = await Promise.all(
    userBudgets.map(async (budget) => {
      const txns = await db.query.transactions.findMany({
        where: and(
          eq(transactions.userId, session.userId),
          eq(transactions.categoryId, budget.categoryId),
          eq(transactions.type, "EXPENSE"),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        ),
      });

      const spent = txns.reduce((sum, t) => sum + parseFloat(t.amount), 0);

      return {
        id: budget.id,
        categoryId: budget.categoryId,
        categoryName: budget.category?.name || "Unknown",
        categoryIcon: budget.category?.icon || null,
        categoryColor: budget.category?.color || null,
        amount: budget.amount,
        spent,
        month: budget.month,
        year: budget.year,
      };
    })
  );

  return budgetsWithSpending;
}

/**
 * Create new budget
 */
export async function createBudget(data: BudgetFormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Check if budget already exists for this category and period
    const existing = await db.query.budgets.findFirst({
      where: and(
        eq(budgets.userId, session.userId),
        eq(budgets.categoryId, data.categoryId),
        eq(budgets.month, data.month),
        eq(budgets.year, data.year)
      ),
    });

    if (existing) {
      return {
        success: false,
        error: "Budget untuk kategori dan periode ini sudah ada",
      };
    }

    await db.insert(budgets).values({
      userId: session.userId,
      categoryId: data.categoryId,
      amount: data.amount,
      month: data.month,
      year: data.year,
    });

    revalidatePath("/dashboard/budgets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Create budget error:", error);
    return { success: false, error: "Gagal membuat budget" };
  }
}

/**
 * Update budget
 */
export async function updateBudget(
  id: string,
  data: BudgetFormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db
      .update(budgets)
      .set({
        categoryId: data.categoryId,
        amount: data.amount,
        month: data.month,
        year: data.year,
        updatedAt: new Date(),
      })
      .where(and(eq(budgets.id, id), eq(budgets.userId, session.userId)));

    revalidatePath("/dashboard/budgets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update budget error:", error);
    return { success: false, error: "Gagal mengupdate budget" };
  }
}

/**
 * Delete budget
 */
export async function deleteBudget(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db
      .delete(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, session.userId)));

    revalidatePath("/dashboard/budgets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete budget error:", error);
    return { success: false, error: "Gagal menghapus budget" };
  }
}
