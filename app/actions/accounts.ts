"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import db from "@/db";
import { accounts } from "@/db/schema";
import { getSession, getEncryptionKey } from "@/lib/auth";
import { encrypt, decryptAccount } from "@/lib/encryption";

export type AccountType =
	| "CASH"
	| "BANK"
	| "E_WALLET"
	| "CREDIT_CARD"
	| "INVESTMENT";

export interface AccountFormData {
	name: string;
	type: AccountType;
	balance: string;
	currency?: string;
	icon?: string;
	color?: string;
}

export interface ActionResult {
	success: boolean;
	error?: string;
}

/**
 * Get all accounts for current user
 */
export async function getAccounts() {
	const session = await getSession();
	if (!session) return [];

	const key = await getEncryptionKey();
	const raw = await db.query.accounts.findMany({
		where: eq(accounts.userId, session.userId),
		orderBy: (accounts, { desc }) => [desc(accounts.createdAt)],
	});

	if (!key) return raw;
	return Promise.all(raw.map((a) => decryptAccount(a, key)));
}

/**
 * Get single account by ID
 */
export async function getAccount(id: string) {
	const session = await getSession();
	if (!session) return null;

	const key = await getEncryptionKey();
	const raw = await db.query.accounts.findFirst({
		where: and(eq(accounts.id, id), eq(accounts.userId, session.userId)),
	});

	if (!raw) return null;
	if (!key) return raw;
	return decryptAccount(raw, key);
}

/**
 * Create new account
 */
export async function createAccount(
	data: AccountFormData,
): Promise<ActionResult> {
	const session = await getSession();
	if (!session) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const key = await getEncryptionKey();
		await db.insert(accounts).values({
			userId: session.userId,
			name: key ? await encrypt(data.name, key) : data.name,
			type: data.type,
			balance: key ? await encrypt(data.balance, key) : data.balance,
			currency: data.currency || "IDR",
			icon: data.icon,
			color: data.color,
		});

		revalidatePath("/dashboard/accounts");
		revalidatePath("/dashboard");
		return { success: true };
	} catch (error) {
		console.error("Create account error:", error);
		return { success: false, error: "Gagal membuat akun" };
	}
}

/**
 * Update existing account
 */
export async function updateAccount(
	id: string,
	data: AccountFormData,
): Promise<ActionResult> {
	const session = await getSession();
	if (!session) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const key = await getEncryptionKey();
		await db
			.update(accounts)
			.set({
				name: key ? await encrypt(data.name, key) : data.name,
				type: data.type,
				balance: key ? await encrypt(data.balance, key) : data.balance,
				currency: data.currency || "IDR",
				icon: data.icon,
				color: data.color,
				updatedAt: new Date(),
			})
			.where(and(eq(accounts.id, id), eq(accounts.userId, session.userId)));

		revalidatePath("/dashboard/accounts");
		revalidatePath("/dashboard");
		return { success: true };
	} catch (error) {
		console.error("Update account error:", error);
		return { success: false, error: "Gagal mengupdate akun" };
	}
}

/**
 * Delete account
 */
export async function deleteAccount(id: string): Promise<ActionResult> {
	const session = await getSession();
	if (!session) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		await db
			.delete(accounts)
			.where(and(eq(accounts.id, id), eq(accounts.userId, session.userId)));

		revalidatePath("/dashboard/accounts");
		revalidatePath("/dashboard");
		return { success: true };
	} catch (error) {
		console.error("Delete account error:", error);
		return { success: false, error: "Gagal menghapus akun" };
	}
}

/**
 * Toggle account active status
 */
export async function toggleAccountStatus(id: string): Promise<ActionResult> {
	const session = await getSession();
	if (!session) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const account = await getAccount(id);
		if (!account) {
			return { success: false, error: "Akun tidak ditemukan" };
		}

		await db
			.update(accounts)
			.set({
				isActive: !account.isActive,
				updatedAt: new Date(),
			})
			.where(and(eq(accounts.id, id), eq(accounts.userId, session.userId)));

		revalidatePath("/dashboard/accounts");
		return { success: true };
	} catch (error) {
		console.error("Toggle account error:", error);
		return { success: false, error: "Gagal mengubah status akun" };
	}
}
