import prisma from "@/lib/prisma";
import { CategoryType } from "../prisma/generated/client";

// Default categories to create for new users
export const DEFAULT_CATEGORIES = [
  // Income categories
  { name: "Gaji", type: CategoryType.INCOME, icon: "💰", color: "#22c55e" },
  { name: "Bonus", type: CategoryType.INCOME, icon: "💵", color: "#16a34a" },
  { name: "Hadiah", type: CategoryType.INCOME, icon: "🎁", color: "#15803d" },
  { name: "Investasi", type: CategoryType.INCOME, icon: "📈", color: "#14532d" },
  { name: "Freelance", type: CategoryType.INCOME, icon: "💼", color: "#4ade80" },

  // Expense categories
  { name: "Makanan & Minuman", type: CategoryType.EXPENSE, icon: "🍔", color: "#ef4444" },
  { name: "Transportasi", type: CategoryType.EXPENSE, icon: "🚗", color: "#f97316" },
  { name: "Belanja", type: CategoryType.EXPENSE, icon: "🛒", color: "#eab308" },
  { name: "Tagihan & Utilitas", type: CategoryType.EXPENSE, icon: "💡", color: "#3b82f6" },
  { name: "Hiburan", type: CategoryType.EXPENSE, icon: "🎮", color: "#8b5cf6" },
  { name: "Kesehatan", type: CategoryType.EXPENSE, icon: "🏥", color: "#ec4899" },
  { name: "Pendidikan", type: CategoryType.EXPENSE, icon: "📚", color: "#06b6d4" },
  { name: "Rumah Tangga", type: CategoryType.EXPENSE, icon: "🏠", color: "#f59e0b" },
];

/**
 * Creates default categories for a user
 * Call this function after user registration
 */
export async function createDefaultCategories(userId: string) {
  const categories = DEFAULT_CATEGORIES.map((cat) => ({
    userId,
    name: cat.name,
    type: cat.type,
    icon: cat.icon,
    color: cat.color,
    isDefault: true,
  }));

  return prisma.category.createMany({
    data: categories,
  });
}
