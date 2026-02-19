"use server";

import { revalidatePath } from "next/cache";
import { eq, and, desc, gte, lte, count } from "drizzle-orm";
import db from "@/db";
import { transfers, accounts } from "@/db/schema";
import { getSession, getEncryptionKey } from "@/lib/auth";
import { encrypt, decrypt, encryptField } from "@/lib/encryption";
import { decryptAccount } from "@/lib/encryption";
import type { Account, Transfer } from "@/db/schema";

type TransferRow = Transfer & { fromAccount: Account; toAccount: Account };

// ============================================
// TYPES
// ============================================

export interface TransferFormData {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  fee?: string;
  description: string;
  note?: string;
  date: Date;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface TransferFilters {
  startDate?: Date;
  endDate?: Date;
  accountId?: string;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
}

// ============================================
// HELPERS
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

async function decryptTransfer(transfer: TransferRow, key: string): Promise<TransferRow> {
  console.log("Decrypting transfer:", transfer);
  return {
    ...transfer,
    amount: await decrypt(transfer.amount, key),
    fee: transfer.fee ? await decrypt(transfer.fee, key) : "0",
    description: await decrypt(transfer.description, key),
    note: transfer.note ? await decrypt(transfer.note, key) : null,
    fromAccount: await decryptAccount(transfer.fromAccount, key),
    toAccount: await decryptAccount(transfer.toAccount, key),
  };
}

// ============================================
// QUERIES
// ============================================

/**
 * Get all transfers with optional filters
 */
export async function getTransfers(filters?: TransferFilters) {
  const session = await getSession();
  if (!session) return [];

  const key = await getEncryptionKey();

  const conditions = [eq(transfers.userId, session.userId)];
  if (filters?.startDate) conditions.push(gte(transfers.date, filters.startDate));
  if (filters?.endDate) conditions.push(lte(transfers.date, filters.endDate));
  if (filters?.accountId) {
    // Show transfers where account is either source or destination
    // We can't do OR easily here, so we'll filter in JS after fetching
  }

  const raw = await db.query.transfers.findMany({
    where: and(...conditions),
    with: {
      fromAccount: true,
      toAccount: true,
    },
    orderBy: [desc(transfers.date), desc(transfers.createdAt)],
  });

  let decrypted: TransferRow[] = key
    ? await Promise.all(raw.map((t) => decryptTransfer(t as TransferRow, key)))
    : (raw as TransferRow[]);

  // JS-level filters (accountId, search)
  if (filters?.accountId) {
    decrypted = decrypted.filter(
      (t) =>
        t.fromAccountId === filters.accountId ||
        t.toAccountId === filters.accountId,
    );
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    decrypted = decrypted.filter((t) =>
      t.description.toLowerCase().includes(q),
    );
  }

  return decrypted;
}

/**
 * Get transfers with pagination
 */
export async function getTransfersPaginated(
  filters?: TransferFilters,
  pagination?: PaginationParams,
) {
  const session = await getSession();
  if (!session)
    return { data: [], total: 0, page: 1, perPage: 15, totalPages: 0 };

  const key = await getEncryptionKey();
  const page = pagination?.page || 1;
  const perPage = pagination?.perPage || 15;

  const conditions = [eq(transfers.userId, session.userId)];
  if (filters?.startDate) conditions.push(gte(transfers.date, filters.startDate));
  if (filters?.endDate) conditions.push(lte(transfers.date, filters.endDate));

  const whereClause = and(...conditions);

  // If search or accountId filter, we need to fetch all, decrypt, filter, then paginate in JS
  if ((filters?.search && key) || filters?.accountId) {
    const allRaw = await db.query.transfers.findMany({
      where: whereClause,
      with: { fromAccount: true, toAccount: true },
      orderBy: [desc(transfers.date), desc(transfers.createdAt)],
    });

    let allDecrypted: TransferRow[] = key
      ? await Promise.all(allRaw.map((t) => decryptTransfer(t as TransferRow, key)))
      : (allRaw as TransferRow[]);

    if (filters?.accountId) {
      allDecrypted = allDecrypted.filter(
        (t) =>
          t.fromAccountId === filters.accountId ||
          t.toAccountId === filters.accountId,
      );
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      allDecrypted = allDecrypted.filter((t) =>
        t.description.toLowerCase().includes(q),
      );
    }

    const total = allDecrypted.length;
    const offset = (page - 1) * perPage;
    const paged = allDecrypted.slice(offset, offset + perPage);

    return {
      data: paged,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  // No JS-level filtering needed — use SQL pagination
  const offset = (page - 1) * perPage;

  const [rawData, totalResult] = await Promise.all([
    db.query.transfers.findMany({
      where: whereClause,
      with: { fromAccount: true, toAccount: true },
      orderBy: [desc(transfers.date), desc(transfers.createdAt)],
      limit: perPage,
      offset,
    }),
    db.select({ count: count() }).from(transfers).where(whereClause),
  ]);

  const total = totalResult[0]?.count || 0;
  const data: TransferRow[] = key
    ? await Promise.all(rawData.map((t) => decryptTransfer(t as TransferRow, key)))
    : (rawData as TransferRow[]);

  return {
    data,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

/**
 * Get recent transfers
 */
export async function getRecentTransfers(limit = 5) {
  const session = await getSession();
  if (!session) return [];

  const key = await getEncryptionKey();

  const raw = await db.query.transfers.findMany({
    where: eq(transfers.userId, session.userId),
    with: {
      fromAccount: true,
      toAccount: true,
    },
    orderBy: [desc(transfers.date), desc(transfers.createdAt)],
    limit,
  });

  if (!key) return raw as TransferRow[];
  return Promise.all(raw.map((t) => decryptTransfer(t as TransferRow, key)));
}

/**
 * Get monthly transfer summary
 */
export async function getMonthlyTransferSummary(year: number, month: number) {
  const session = await getSession();
  if (!session) return { totalTransferred: 0, totalFees: 0, count: 0 };

  const key = await getEncryptionKey();
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const raw = await db.query.transfers.findMany({
    where: and(
      eq(transfers.userId, session.userId),
      gte(transfers.date, startDate),
      lte(transfers.date, endDate),
    ),
    with: {
      fromAccount: true,
      toAccount: true,
    },
  });

  const decrypted = key
    ? await Promise.all(raw.map((t) => decryptTransfer(t as TransferRow, key)))
    : (raw as TransferRow[]);

  const totalTransferred = decrypted.reduce(
    (sum, t) => sum + parseFloat(t.amount),
    0,
  );
  const totalFees = decrypted.reduce(
    (sum, t) => sum + parseFloat(t.fee || "0"),
    0,
  );

  return { totalTransferred, totalFees, count: decrypted.length };
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new transfer between accounts
 */
export async function createTransfer(
  data: TransferFormData,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  if (data.fromAccountId === data.toAccountId) {
    return { success: false, error: "Akun asal dan tujuan tidak boleh sama" };
  }

  try {
    const key = await getEncryptionKey();
    const amountNum = parseFloat(data.amount);
    const feeNum = parseFloat(data.fee || "0");

    if (amountNum <= 0) {
      return { success: false, error: "Nominal harus lebih dari 0" };
    }

    // Get source account balance
    const fromAccData = await getDecryptedAccountBalance(
      data.fromAccountId,
      session.userId,
      key,
    );
    if (!fromAccData) {
      return { success: false, error: "Akun asal tidak ditemukan" };
    }

    // Check sufficient balance (amount + fee)
    const totalDeduction = amountNum + feeNum;
    if (fromAccData.balance < totalDeduction) {
      return {
        success: false,
        error: `Saldo tidak cukup. Saldo tersedia: ${fromAccData.balance}, diperlukan: ${totalDeduction} (termasuk biaya ${feeNum})`,
      };
    }

    // Get destination account
    const toAccData = await getDecryptedAccountBalance(
      data.toAccountId,
      session.userId,
      key,
    );
    if (!toAccData) {
      return { success: false, error: "Akun tujuan tidak ditemukan" };
    }

    // Create transfer record
    const feeStr = data.fee || "0";
    await db.insert(transfers).values({
      userId: session.userId,
      fromAccountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      amount: key ? await encrypt(data.amount, key) : data.amount,
      fee: key ? await encrypt(feeStr, key) : feeStr,
      description: key
        ? await encrypt(data.description, key)
        : data.description,
      note: key
        ? await encryptField(data.note ?? null, key)
        : (data.note ?? null),
      date: new Date(data.date),
    });

    // Update balances: source loses amount + fee, destination gains amount
    await updateAccountBalance(
      data.fromAccountId,
      session.userId,
      fromAccData.balance - totalDeduction,
      key,
    );
    await updateAccountBalance(
      data.toAccountId,
      session.userId,
      toAccData.balance + amountNum,
      key,
    );

    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/accounts");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Create transfer error:", error);
    return { success: false, error: "Gagal membuat transfer" };
  }
}

/**
 * Update existing transfer
 */
export async function updateTransfer(
  id: string,
  data: TransferFormData,
  originalAmount: string,
  originalFee: string,
  originalFromAccountId: string,
  originalToAccountId: string,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  if (data.fromAccountId === data.toAccountId) {
    return { success: false, error: "Akun asal dan tujuan tidak boleh sama" };
  }

  try {
    const key = await getEncryptionKey();
    const origAmountNum = parseFloat(originalAmount);
    const origFeeNum = parseFloat(originalFee);
    const newAmountNum = parseFloat(data.amount);
    const newFeeNum = parseFloat(data.fee || "0");

    // Step 1: Revert original transfer balances
    const origFromAcc = await getDecryptedAccountBalance(
      originalFromAccountId,
      session.userId,
      key,
    );
    const origToAcc = await getDecryptedAccountBalance(
      originalToAccountId,
      session.userId,
      key,
    );

    if (origFromAcc) {
      // Revert: add back amount + fee to source
      await updateAccountBalance(
        originalFromAccountId,
        session.userId,
        origFromAcc.balance + origAmountNum + origFeeNum,
        key,
      );
    }
    if (origToAcc) {
      // Revert: remove amount from destination
      await updateAccountBalance(
        originalToAccountId,
        session.userId,
        origToAcc.balance - origAmountNum,
        key,
      );
    }

    // Step 2: Apply new transfer balances
    const newFromAcc = await getDecryptedAccountBalance(
      data.fromAccountId,
      session.userId,
      key,
    );
    const newToAcc = await getDecryptedAccountBalance(
      data.toAccountId,
      session.userId,
      key,
    );

    if (!newFromAcc) {
      return { success: false, error: "Akun asal tidak ditemukan" };
    }
    if (!newToAcc) {
      return { success: false, error: "Akun tujuan tidak ditemukan" };
    }

    const totalDeduction = newAmountNum + newFeeNum;
    if (newFromAcc.balance < totalDeduction) {
      // Revert the revert (restore original balances)
      if (origFromAcc) {
        await updateAccountBalance(
          originalFromAccountId,
          session.userId,
          origFromAcc.balance,
          key,
        );
      }
      if (origToAcc) {
        await updateAccountBalance(
          originalToAccountId,
          session.userId,
          origToAcc.balance,
          key,
        );
      }
      return {
        success: false,
        error: `Saldo tidak cukup. Saldo tersedia: ${newFromAcc.balance}, diperlukan: ${totalDeduction}`,
      };
    }

    await updateAccountBalance(
      data.fromAccountId,
      session.userId,
      newFromAcc.balance - totalDeduction,
      key,
    );
    await updateAccountBalance(
      data.toAccountId,
      session.userId,
      newToAcc.balance + newAmountNum,
      key,
    );

    // Step 3: Update transfer record
    const feeStr = data.fee || "0";
    await db
      .update(transfers)
      .set({
        fromAccountId: data.fromAccountId,
        toAccountId: data.toAccountId,
        amount: key ? await encrypt(data.amount, key) : data.amount,
        fee: key ? await encrypt(feeStr, key) : feeStr,
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
        and(eq(transfers.id, id), eq(transfers.userId, session.userId)),
      );

    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/accounts");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update transfer error:", error);
    return { success: false, error: "Gagal mengupdate transfer" };
  }
}

/**
 * Delete transfer and revert account balances
 */
export async function deleteTransfer(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const key = await getEncryptionKey();

    // Get transfer to revert
    const transfer = await db.query.transfers.findFirst({
      where: and(
        eq(transfers.id, id),
        eq(transfers.userId, session.userId),
      ),
    });

    if (!transfer) {
      return { success: false, error: "Transfer tidak ditemukan" };
    }

    // Decrypt amounts
    const amountStr = key ? await decrypt(transfer.amount, key) : transfer.amount;
    const feeStr = key && transfer.fee ? await decrypt(transfer.fee, key) : (transfer.fee || "0");
    const amountNum = parseFloat(amountStr);
    const feeNum = parseFloat(feeStr);

    // Revert source account: add back amount + fee
    const fromAccData = await getDecryptedAccountBalance(
      transfer.fromAccountId,
      session.userId,
      key,
    );
    if (fromAccData) {
      await updateAccountBalance(
        transfer.fromAccountId,
        session.userId,
        fromAccData.balance + amountNum + feeNum,
        key,
      );
    }

    // Revert destination account: subtract amount
    const toAccData = await getDecryptedAccountBalance(
      transfer.toAccountId,
      session.userId,
      key,
    );
    if (toAccData) {
      await updateAccountBalance(
        transfer.toAccountId,
        session.userId,
        toAccData.balance - amountNum,
        key,
      );
    }

    // Delete transfer
    await db
      .delete(transfers)
      .where(
        and(eq(transfers.id, id), eq(transfers.userId, session.userId)),
      );

    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/accounts");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete transfer error:", error);
    return { success: false, error: "Gagal menghapus transfer" };
  }
}
