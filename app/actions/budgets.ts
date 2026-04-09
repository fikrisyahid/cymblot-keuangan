"use server";

import { revalidatePath } from "next/cache";
import { eq, and, gte, lte } from "drizzle-orm";
import db from "@/db";
import { budgets, transactions } from "@/db/schema";
import { getSession, getEncryptionKey } from "@/lib/auth";
import { encrypt, decrypt, decryptCategory } from "@/lib/encryption";

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

type BudgetsWithSpendingParams = {
	monthly?: boolean;
};

/**
 * Get budgets with spending calculation
 */
export async function getBudgetsWithSpending(
	params?: BudgetsWithSpendingParams,
): Promise<BudgetWithSpending[]> {
	const { monthly = false } = params || {};

	const session = await getSession();
	if (!session) return [];

	const key = await getEncryptionKey();
	const now = new Date();
	const currentMonth = now.getMonth() + 1;
	const currentYear = now.getFullYear();

	const whereOptions = [eq(budgets.userId, session.userId)];

	if (monthly) {
		whereOptions.push(eq(budgets.month, currentMonth));
		whereOptions.push(eq(budgets.year, currentYear));
	}

	const userBudgets = await db.query.budgets.findMany({
		where: and(...whereOptions),
		with: {
			category: true,
		},
		orderBy: (budgets, { asc }) => [asc(budgets.createdAt)],
	});

	const startDate = new Date(currentYear, currentMonth - 1, 1);
	const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

	const budgetsWithSpending = await Promise.all(
		userBudgets.map(async (budget) => {
			const txns = await db.query.transactions.findMany({
				where: and(
					eq(transactions.userId, session.userId),
					eq(transactions.categoryId, budget.categoryId),
					eq(transactions.type, "EXPENSE"),
					gte(transactions.date, startDate),
					lte(transactions.date, endDate),
				),
			});

			// Decrypt transaction amounts to calculate spending
			let spent = 0;
			for (const t of txns) {
				const amount = key
					? parseFloat(await decrypt(t.amount, key))
					: parseFloat(t.amount);
				spent += amount;
			}

			// Decrypt budget amount and category name
			const decryptedAmount = key
				? await decrypt(budget.amount, key)
				: budget.amount;
			const decryptedCategory =
				key && budget.category
					? await decryptCategory(budget.category, key)
					: budget.category;

			return {
				id: budget.id,
				categoryId: budget.categoryId,
				categoryName: decryptedCategory?.name || "Unknown",
				categoryIcon: decryptedCategory?.icon || null,
				categoryColor: decryptedCategory?.color || null,
				amount: decryptedAmount,
				spent,
				month: budget.month,
				year: budget.year,
			};
		}),
	);

	return budgetsWithSpending;
}

/**
 * Create new budget
 */
export async function createBudget(
	data: BudgetFormData,
): Promise<ActionResult> {
	const session = await getSession();
	if (!session) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const key = await getEncryptionKey();

		const existing = await db.query.budgets.findFirst({
			where: and(
				eq(budgets.userId, session.userId),
				eq(budgets.categoryId, data.categoryId),
				eq(budgets.month, data.month),
				eq(budgets.year, data.year),
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
			amount: key ? await encrypt(data.amount, key) : data.amount,
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
	data: BudgetFormData,
): Promise<ActionResult> {
	const session = await getSession();
	if (!session) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const key = await getEncryptionKey();

		await db
			.update(budgets)
			.set({
				categoryId: data.categoryId,
				amount: key ? await encrypt(data.amount, key) : data.amount,
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
