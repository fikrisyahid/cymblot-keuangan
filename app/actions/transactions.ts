"use server";

import { revalidatePath } from "next/cache";
import { eq, and, desc, gte, lte, count } from "drizzle-orm";
import db from "@/db";
import { transactions, accounts } from "@/db/schema";
import { getSession, getEncryptionKey } from "@/lib/auth";
import {
  encrypt,
  decrypt,
  encryptField,
  decryptTransaction,
} from "@/lib/encryption";

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
  search?: string;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/**
 * Build SQL filter conditions (excludes search — done in JS after decrypt)
 */
function buildFilterConditions(userId: string, filters?: TransactionFilters) {
  const conditions = [eq(transactions.userId, userId)];

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
  // NOTE: search is handled in JS after decryption (can't ilike on ciphertext)

  return conditions;
}

/**
 * Get transactions with optional filters
 */
export async function getTransactions(filters?: TransactionFilters) {
  const session = await getSession();
  if (!session) return [];

  const key = await getEncryptionKey();
  const conditions = buildFilterConditions(session.userId, filters);

  const raw = await db.query.transactions.findMany({
    where: and(...conditions),
    with: {
      account: true,
      category: true,
    },
    orderBy: [desc(transactions.date), desc(transactions.createdAt)],
  });

  if (!key) return raw;

  let decrypted = await Promise.all(
    raw.map((t) => decryptTransaction(t, key)),
  );

  // Apply search filter in JS (on decrypted description)
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    decrypted = decrypted.filter((t) =>
      t.description.toLowerCase().includes(q),
    );
  }

  return decrypted;
}

/**
 * Get transactions with pagination and filters (server-side)
 */
export async function getTransactionsPaginated(
  filters?: TransactionFilters,
  pagination?: PaginationParams,
) {
  const session = await getSession();
  if (!session)
    return { data: [], total: 0, page: 1, perPage: 15, totalPages: 0 };

  const key = await getEncryptionKey();
  const page = pagination?.page || 1;
  const perPage = pagination?.perPage || 15;

  const conditions = buildFilterConditions(session.userId, filters);
  const whereClause = and(...conditions);

  if (filters?.search && key) {
    // Search requires decryption — fetch all matching SQL filters, decrypt, search in JS, paginate in JS
    const allRaw = await db.query.transactions.findMany({
      where: whereClause,
      with: { account: true, category: true },
      orderBy: [desc(transactions.date), desc(transactions.createdAt)],
    });

    const allDecrypted = await Promise.all(
      allRaw.map((t) => decryptTransaction(t, key)),
    );

    const q = filters.search.toLowerCase();
    const filtered = allDecrypted.filter((t) =>
      t.description.toLowerCase().includes(q),
    );

    const total = filtered.length;
    const offset = (page - 1) * perPage;
    const paged = filtered.slice(offset, offset + perPage);

    return {
      data: paged,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  // No search — use SQL pagination
  const offset = (page - 1) * perPage;

  const [rawData, totalResult] = await Promise.all([
    db.query.transactions.findMany({
      where: whereClause,
      with: { account: true, category: true },
      orderBy: [desc(transactions.date), desc(transactions.createdAt)],
      limit: perPage,
      offset,
    }),
    db.select({ count: count() }).from(transactions).where(whereClause),
  ]);

  const total = totalResult[0]?.count || 0;
  const data = key
    ? await Promise.all(rawData.map((t) => decryptTransaction(t, key)))
    : rawData;

  return {
    data,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

/**
 * Get top transactions (biggest income/expense) for a date range
 * Sorts by decrypted amount in JS since amount is encrypted
 */
export async function getTopTransactions(
  type: TransactionType,
  startDate: Date,
  endDate: Date,
  limitCount = 5,
) {
  const session = await getSession();
  if (!session) return [];

  const key = await getEncryptionKey();

  const raw = await db.query.transactions.findMany({
    where: and(
      eq(transactions.userId, session.userId),
      eq(transactions.type, type),
      gte(transactions.date, startDate),
      lte(transactions.date, endDate),
    ),
    with: {
      account: true,
      category: true,
    },
    orderBy: [desc(transactions.date)],
  });

  if (!key) return raw.slice(0, limitCount);

  const decrypted = await Promise.all(
    raw.map((t) => decryptTransaction(t, key)),
  );

  // Sort by amount descending (in JS since amount is encrypted)
  decrypted.sort(
    (a, b) => parseFloat(b.amount) - parseFloat(a.amount),
  );

  return decrypted.slice(0, limitCount);
}

export interface CategorySummary {
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  total: number;
  count: number;
  percentage: number;
}

/**
 * Get spending/income aggregated by category for a date range
 */
export async function getCategorySummary(
  type: TransactionType,
  startDate: Date,
  endDate: Date,
  limitCount = 5,
): Promise<CategorySummary[]> {
  const session = await getSession();
  if (!session) return [];

  const key = await getEncryptionKey();

  const raw = await db.query.transactions.findMany({
    where: and(
      eq(transactions.userId, session.userId),
      eq(transactions.type, type),
      gte(transactions.date, startDate),
      lte(transactions.date, endDate),
    ),
    with: {
      category: true,
    },
  });

  // Decrypt if needed
  const txns = key
    ? await Promise.all(raw.map((t) => decryptTransaction(t, key)))
    : raw;

  const categoryMap = new Map<
    string,
    {
      name: string;
      icon: string;
      color: string;
      total: number;
      count: number;
    }
  >();

  let grandTotal = 0;

  for (const txn of txns) {
    const k = txn.categoryId || "__uncategorized__";
    const existing = categoryMap.get(k);
    const amount = parseFloat(txn.amount);
    grandTotal += amount;

    if (existing) {
      existing.total += amount;
      existing.count += 1;
    } else {
      categoryMap.set(k, {
        name: txn.category?.name || "Tanpa Kategori",
        icon: txn.category?.icon || "📦",
        color: txn.category?.color || "gray",
        total: amount,
        count: 1,
      });
    }
  }

  return Array.from(categoryMap.entries())
    .map(([categoryId, data]) => ({
      categoryId: categoryId === "__uncategorized__" ? null : categoryId,
      categoryName: data.name,
      categoryIcon: data.icon,
      categoryColor: data.color,
      total: data.total,
      count: data.count,
      percentage: grandTotal > 0 ? (data.total / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limitCount);
}

/**
 * Get recent transactions
 */
export async function getRecentTransactions(limit = 10) {
  const session = await getSession();
  if (!session) return [];

  const key = await getEncryptionKey();

  const raw = await db.query.transactions.findMany({
    where: eq(transactions.userId, session.userId),
    with: {
      account: true,
      category: true,
    },
    orderBy: [desc(transactions.date), desc(transactions.createdAt)],
    limit,
  });

  if (!key) return raw;
  return Promise.all(raw.map((t) => decryptTransaction(t, key)));
}

/**
 * Get monthly summary (income, expense)
 */
export async function getMonthlySummary(year: number, month: number) {
  const session = await getSession();
  if (!session) return { income: 0, expense: 0 };

  const key = await getEncryptionKey();
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const raw = await db.query.transactions.findMany({
    where: and(
      eq(transactions.userId, session.userId),
      gte(transactions.date, startDate),
      lte(transactions.date, endDate),
    ),
  });

  // Decrypt amounts
  const txns = key
    ? await Promise.all(
        raw.map(async (t) => ({
          ...t,
          amount: await decrypt(t.amount, key),
        })),
      )
    : raw;

  const income = txns
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const expense = txns
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return { income, expense };
}

// ============================================
// HELPER: Read & decrypt account balance
// ============================================

async function getDecryptedAccountBalance(
  accountId: string,
  userId: string,
  key: string | null,
): Promise<{ account: typeof accounts.$inferSelect; balance: number } | null> {
  const account = await db.query.accounts.findFirst({
    where: and(eq(accounts.id, accountId), eq(accounts.userId, userId)),
  });
  if (!account) return null;

  const balance = key
    ? parseFloat(await decrypt(account.balance, key))
    : parseFloat(account.balance);

  return { account, balance };
}

async function updateAccountBalance(
  accountId: string,
  userId: string,
  newBalance: number,
  key: string | null,
) {
  const balanceStr = newBalance.toString();
  await db
    .update(accounts)
    .set({
      balance: key ? await encrypt(balanceStr, key) : balanceStr,
      updatedAt: new Date(),
    })
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)));
}

/**
 * Create new transaction
 */
export async function createTransaction(
  data: TransactionFormData,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const key = await getEncryptionKey();
    const amountNum = parseFloat(data.amount);

    // Get account with decrypted balance
    const accData = await getDecryptedAccountBalance(
      data.accountId,
      session.userId,
      key,
    );
    if (!accData) {
      return { success: false, error: "Akun tidak ditemukan" };
    }

    // Check sufficient balance for expense
    if (data.type === "EXPENSE" && accData.balance < amountNum) {
      return {
        success: false,
        error: `Saldo tidak cukup. Saldo tersedia: ${accData.balance}, diperlukan: ${amountNum}`,
      };
    }

    // Create transaction (encrypted)
    await db.insert(transactions).values({
      userId: session.userId,
      accountId: data.accountId,
      categoryId: data.categoryId || null,
      amount: key ? await encrypt(data.amount, key) : data.amount,
      type: data.type,
      description: key
        ? await encrypt(data.description, key)
        : data.description,
      note: key ? await encryptField(data.note ?? null, key) : (data.note ?? null),
      date: data.date,
    });

    // Update account balance
    const balanceChange =
      data.type === "INCOME" ? amountNum : -amountNum;
    await updateAccountBalance(
      data.accountId,
      session.userId,
      accData.balance + balanceChange,
      key,
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
  originalAccountId: string,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const key = await getEncryptionKey();
    const originalAmountNum = parseFloat(originalAmount);
    const newAmountNum = parseFloat(data.amount);

    // Get current account balance (decrypted)
    const accData = await getDecryptedAccountBalance(
      data.accountId,
      session.userId,
      key,
    );
    if (!accData) {
      return { success: false, error: "Akun tidak ditemukan" };
    }

    if (data.accountId !== originalAccountId) {
      // Different account: revert from original, apply to new
      const origAccData = await getDecryptedAccountBalance(
        originalAccountId,
        session.userId,
        key,
      );
      if (!origAccData) {
        return { success: false, error: "Akun original tidak ditemukan" };
      }

      if (data.type === "EXPENSE" && accData.balance < newAmountNum) {
        return {
          success: false,
          error: `Saldo akun tidak cukup. Saldo tersedia: ${accData.balance}, diperlukan: ${newAmountNum}`,
        };
      }

      // Revert original account
      const origRevert =
        originalType === "INCOME"
          ? -originalAmountNum
          : originalAmountNum;
      await updateAccountBalance(
        originalAccountId,
        session.userId,
        origAccData.balance + origRevert,
        key,
      );

      // Apply to new account
      const newChange =
        data.type === "INCOME" ? newAmountNum : -newAmountNum;
      await updateAccountBalance(
        data.accountId,
        session.userId,
        accData.balance + newChange,
        key,
      );
    } else {
      // Same account
      const revertChange =
        originalType === "INCOME"
          ? -originalAmountNum
          : originalAmountNum;
      const balanceAfterRevert = accData.balance + revertChange;

      if (data.type === "EXPENSE" && balanceAfterRevert < newAmountNum) {
        return {
          success: false,
          error: `Saldo tidak cukup. Saldo tersedia setelah revert: ${balanceAfterRevert}, diperlukan: ${newAmountNum}`,
        };
      }

      const finalBalance =
        balanceAfterRevert +
        (data.type === "INCOME" ? newAmountNum : -newAmountNum);
      await updateAccountBalance(
        data.accountId,
        session.userId,
        finalBalance,
        key,
      );
    }

    // Update transaction (encrypted)
    await db
      .update(transactions)
      .set({
        accountId: data.accountId,
        categoryId: data.categoryId || null,
        amount: key ? await encrypt(data.amount, key) : data.amount,
        type: data.type,
        description: key
          ? await encrypt(data.description, key)
          : data.description,
        note: key
          ? await encryptField(data.note ?? null, key)
          : (data.note ?? null),
        date: data.date,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(transactions.id, id),
          eq(transactions.userId, session.userId),
        ),
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
    const key = await getEncryptionKey();

    // Get transaction to revert balance
    const txn = await db.query.transactions.findFirst({
      where: and(
        eq(transactions.id, id),
        eq(transactions.userId, session.userId),
      ),
    });

    if (!txn) {
      return { success: false, error: "Transaksi tidak ditemukan" };
    }

    // Decrypt amount for balance calculation
    const amountStr = key ? await decrypt(txn.amount, key) : txn.amount;
    const amountNum = parseFloat(amountStr);

    // Get account balance (decrypted)
    const accData = await getDecryptedAccountBalance(
      txn.accountId,
      session.userId,
      key,
    );

    if (accData) {
      const revertChange =
        txn.type === "INCOME" ? -amountNum : amountNum;
      await updateAccountBalance(
        txn.accountId,
        session.userId,
        accData.balance + revertChange,
        key,
      );
    }

    // Delete transaction
    await db
      .delete(transactions)
      .where(
        and(
          eq(transactions.id, id),
          eq(transactions.userId, session.userId),
        ),
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
