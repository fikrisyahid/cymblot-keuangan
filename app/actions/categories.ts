"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import db from "@/db";
import { categories } from "@/db/schema";
import { getSession, getEncryptionKey } from "@/lib/auth";
import { encrypt, decryptCategory } from "@/lib/encryption";

export type CategoryType = "INCOME" | "EXPENSE";

export interface CategoryFormData {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Get all categories for current user
 */
export async function getCategories() {
  const session = await getSession();
  if (!session) return [];

  const key = await getEncryptionKey();
  const raw = await db.query.categories.findMany({
    where: eq(categories.userId, session.userId),
    orderBy: (categories, { asc }) => [asc(categories.type), asc(categories.name)],
  });

  if (!key) return raw;
  return Promise.all(raw.map((c) => decryptCategory(c, key)));
}

/**
 * Get categories by type
 */
export async function getCategoriesByType(type: CategoryType) {
  const session = await getSession();
  if (!session) return [];

  const key = await getEncryptionKey();
  const raw = await db.query.categories.findMany({
    where: and(
      eq(categories.userId, session.userId),
      eq(categories.type, type)
    ),
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });

  if (!key) return raw;
  return Promise.all(raw.map((c) => decryptCategory(c, key)));
}

/**
 * Create new category
 */
export async function createCategory(data: CategoryFormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const key = await getEncryptionKey();
    await db.insert(categories).values({
      userId: session.userId,
      name: key ? await encrypt(data.name, key) : data.name,
      type: data.type,
      icon: data.icon,
      color: data.color,
      isDefault: false,
    });

    revalidatePath("/dashboard/categories");
    return { success: true };
  } catch (error) {
    console.error("Create category error:", error);
    return { success: false, error: "Gagal membuat kategori" };
  }
}

/**
 * Update existing category
 */
export async function updateCategory(
  id: string,
  data: CategoryFormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const key = await getEncryptionKey();
    await db
      .update(categories)
      .set({
        name: key ? await encrypt(data.name, key) : data.name,
        type: data.type,
        icon: data.icon,
        color: data.color,
        updatedAt: new Date(),
      })
      .where(and(eq(categories.id, id), eq(categories.userId, session.userId)));

    revalidatePath("/dashboard/categories");
    return { success: true };
  } catch (error) {
    console.error("Update category error:", error);
    return { success: false, error: "Gagal mengupdate kategori" };
  }
}

/**
 * Delete category (only non-default)
 */
export async function deleteCategory(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Check if it's a default category
    const category = await db.query.categories.findFirst({
      where: and(eq(categories.id, id), eq(categories.userId, session.userId)),
    });

    if (!category) {
      return { success: false, error: "Kategori tidak ditemukan" };
    }

    if (category.isDefault) {
      return { success: false, error: "Kategori default tidak bisa dihapus" };
    }

    await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, session.userId)));

    revalidatePath("/dashboard/categories");
    return { success: true };
  } catch (error) {
    console.error("Delete category error:", error);
    return { success: false, error: "Gagal menghapus kategori" };
  }
}
