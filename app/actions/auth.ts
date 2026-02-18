"use server";

import { eq } from "drizzle-orm";
import db from "@/db";
import {
  users,
  accounts,
  categories,
  transactions,
  budgets,
  recurringTransactions,
  debts,
} from "@/db/schema";
import {
  hashPassword,
  verifyPassword,
  createSession,
  setSessionCookie,
  clearSessionCookie,
  getSession,
  setEncryptionKeyCookie,
} from "@/lib/auth";
import { createDefaultCategories } from "@/lib/categories";
import {
  deriveEncryptionKey,
  createVerifier,
  encrypt,
  decrypt,
} from "@/lib/encryption";

export interface AuthResult {
  success: boolean;
  error?: string;
}

// ============================================
// REGISTER
// ============================================

export async function register(formData: FormData): Promise<AuthResult> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !password || !confirmPassword) {
    return { success: false, error: "Semua field harus diisi" };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Password tidak cocok" };
  }

  if (password.length < 6) {
    return { success: false, error: "Password minimal 6 karakter" };
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  if (existingUser) {
    return { success: false, error: "Email sudah terdaftar" };
  }

  // Derive encryption key from password
  const derived = await deriveEncryptionKey(password);
  const verifier = await createVerifier(derived.key);

  // Create user with encryption metadata
  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({
      name,
      email: email.toLowerCase(),
      passwordHash,
      encryptionSalt: derived.salt,
      encryptionVerifier: verifier,
      isDataEncrypted: true,
    })
    .returning();

  // Create default categories (already encrypted)
  await createDefaultCategories(user.id, derived.key);

  // Session + encryption key cookie
  const token = await createSession(user.id, user.email, user.name);
  await setSessionCookie(token);
  await setEncryptionKeyCookie(derived.key);

  return { success: true };
}

// ============================================
// LOGIN
// ============================================

export async function login(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email dan password harus diisi" };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  if (!user) {
    return { success: false, error: "Email atau password salah" };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { success: false, error: "Email atau password salah" };
  }

  let encryptionKey: string;

  if (!user.encryptionSalt) {
    // LAZY MIGRATION: first login after encryption feature deployed.
    // Derive key, encrypt all existing plaintext data.
    const derived = await deriveEncryptionKey(password);
    encryptionKey = derived.key;
    const verifier = await createVerifier(encryptionKey);

    await migrateUserData(user.id, encryptionKey);

    await db
      .update(users)
      .set({
        encryptionSalt: derived.salt,
        encryptionVerifier: verifier,
        isDataEncrypted: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
  } else {
    // Derive key from password + stored salt
    const derived = await deriveEncryptionKey(password, user.encryptionSalt);
    encryptionKey = derived.key;
  }

  const token = await createSession(user.id, user.email, user.name);
  await setSessionCookie(token);
  await setEncryptionKeyCookie(encryptionKey);

  return { success: true };
}

// ============================================
// LOGOUT
// ============================================

export async function logout(): Promise<void> {
  await clearSessionCookie();
}

// ============================================
// CHANGE PASSWORD
// ============================================

export async function changePassword(formData: FormData): Promise<AuthResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Anda harus login terlebih dahulu" };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmNewPassword = formData.get("confirmNewPassword") as string;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return { success: false, error: "Semua field harus diisi" };
  }

  if (newPassword !== confirmNewPassword) {
    return { success: false, error: "Password baru tidak cocok" };
  }

  if (newPassword.length < 6) {
    return { success: false, error: "Password baru minimal 6 karakter" };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user) {
    return { success: false, error: "User tidak ditemukan" };
  }

  const isValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValid) {
    return { success: false, error: "Password lama salah" };
  }

  // Derive OLD key (to decrypt), NEW key (to re-encrypt)
  const oldDerived = await deriveEncryptionKey(
    currentPassword,
    user.encryptionSalt!,
  );
  const newDerived = await deriveEncryptionKey(newPassword);
  const newVerifier = await createVerifier(newDerived.key);

  // Re-encrypt all user data
  await reencryptUserData(session.userId, oldDerived.key, newDerived.key);

  // Update password hash + encryption metadata
  const newPasswordHash = await hashPassword(newPassword);
  await db
    .update(users)
    .set({
      passwordHash: newPasswordHash,
      encryptionSalt: newDerived.salt,
      encryptionVerifier: newVerifier,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.userId));

  await setEncryptionKeyCookie(newDerived.key);

  return { success: true };
}

// ============================================
// LAZY MIGRATION: encrypt existing plaintext data
// ============================================

async function migrateUserData(
  userId: string,
  encryptionKey: string,
): Promise<void> {
  const [
    userAccounts,
    userCategories,
    userTransactions,
    userBudgets,
    userRecurring,
    userDebts,
  ] = await Promise.all([
    db.query.accounts.findMany({ where: eq(accounts.userId, userId) }),
    db.query.categories.findMany({ where: eq(categories.userId, userId) }),
    db.query.transactions.findMany({
      where: eq(transactions.userId, userId),
    }),
    db.query.budgets.findMany({ where: eq(budgets.userId, userId) }),
    db.query.recurringTransactions.findMany({
      where: eq(recurringTransactions.userId, userId),
    }),
    db.query.debts.findMany({ where: eq(debts.userId, userId) }),
  ]);

  await db.transaction(async (tx) => {
    for (const acc of userAccounts) {
      await tx
        .update(accounts)
        .set({
          name: await encrypt(acc.name, encryptionKey),
          balance: await encrypt(acc.balance, encryptionKey),
        })
        .where(eq(accounts.id, acc.id));
    }

    for (const cat of userCategories) {
      await tx
        .update(categories)
        .set({ name: await encrypt(cat.name, encryptionKey) })
        .where(eq(categories.id, cat.id));
    }

    for (const txn of userTransactions) {
      await tx
        .update(transactions)
        .set({
          amount: await encrypt(txn.amount, encryptionKey),
          description: await encrypt(txn.description, encryptionKey),
          note: txn.note
            ? await encrypt(txn.note, encryptionKey)
            : null,
        })
        .where(eq(transactions.id, txn.id));
    }

    for (const budget of userBudgets) {
      await tx
        .update(budgets)
        .set({ amount: await encrypt(budget.amount, encryptionKey) })
        .where(eq(budgets.id, budget.id));
    }

    for (const rec of userRecurring) {
      await tx
        .update(recurringTransactions)
        .set({
          amount: await encrypt(rec.amount, encryptionKey),
          description: await encrypt(rec.description, encryptionKey),
        })
        .where(eq(recurringTransactions.id, rec.id));
    }

    for (const debt of userDebts) {
      await tx
        .update(debts)
        .set({
          personName: await encrypt(debt.personName, encryptionKey),
          amount: await encrypt(debt.amount, encryptionKey),
          remainingAmount: await encrypt(
            debt.remainingAmount,
            encryptionKey,
          ),
          description: debt.description
            ? await encrypt(debt.description, encryptionKey)
            : null,
        })
        .where(eq(debts.id, debt.id));
    }
  });
}

// ============================================
// RE-ENCRYPT: decrypt with old key, encrypt with new key
// ============================================

async function reencryptUserData(
  userId: string,
  oldKey: string,
  newKey: string,
): Promise<void> {
  const [
    userAccounts,
    userCategories,
    userTransactions,
    userBudgets,
    userRecurring,
    userDebts,
  ] = await Promise.all([
    db.query.accounts.findMany({ where: eq(accounts.userId, userId) }),
    db.query.categories.findMany({ where: eq(categories.userId, userId) }),
    db.query.transactions.findMany({
      where: eq(transactions.userId, userId),
    }),
    db.query.budgets.findMany({ where: eq(budgets.userId, userId) }),
    db.query.recurringTransactions.findMany({
      where: eq(recurringTransactions.userId, userId),
    }),
    db.query.debts.findMany({ where: eq(debts.userId, userId) }),
  ]);

  await db.transaction(async (tx) => {
    for (const acc of userAccounts) {
      await tx
        .update(accounts)
        .set({
          name: await encrypt(await decrypt(acc.name, oldKey), newKey),
          balance: await encrypt(
            await decrypt(acc.balance, oldKey),
            newKey,
          ),
        })
        .where(eq(accounts.id, acc.id));
    }

    for (const cat of userCategories) {
      await tx
        .update(categories)
        .set({
          name: await encrypt(await decrypt(cat.name, oldKey), newKey),
        })
        .where(eq(categories.id, cat.id));
    }

    for (const txn of userTransactions) {
      await tx
        .update(transactions)
        .set({
          amount: await encrypt(
            await decrypt(txn.amount, oldKey),
            newKey,
          ),
          description: await encrypt(
            await decrypt(txn.description, oldKey),
            newKey,
          ),
          note: txn.note
            ? await encrypt(await decrypt(txn.note, oldKey), newKey)
            : null,
        })
        .where(eq(transactions.id, txn.id));
    }

    for (const budget of userBudgets) {
      await tx
        .update(budgets)
        .set({
          amount: await encrypt(
            await decrypt(budget.amount, oldKey),
            newKey,
          ),
        })
        .where(eq(budgets.id, budget.id));
    }

    for (const rec of userRecurring) {
      await tx
        .update(recurringTransactions)
        .set({
          amount: await encrypt(
            await decrypt(rec.amount, oldKey),
            newKey,
          ),
          description: await encrypt(
            await decrypt(rec.description, oldKey),
            newKey,
          ),
        })
        .where(eq(recurringTransactions.id, rec.id));
    }

    for (const debt of userDebts) {
      await tx
        .update(debts)
        .set({
          personName: await encrypt(
            await decrypt(debt.personName, oldKey),
            newKey,
          ),
          amount: await encrypt(
            await decrypt(debt.amount, oldKey),
            newKey,
          ),
          remainingAmount: await encrypt(
            await decrypt(debt.remainingAmount, oldKey),
            newKey,
          ),
          description: debt.description
            ? await encrypt(
                await decrypt(debt.description, oldKey),
                newKey,
              )
            : null,
        })
        .where(eq(debts.id, debt.id));
    }
  });
}
