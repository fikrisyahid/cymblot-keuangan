import db from "@/db";
import { categories } from "@/db/schema";

// Default categories to create for new users
export const DEFAULT_CATEGORIES = [
  // Income categories
  { name: "Gaji", type: "INCOME" as const, icon: "💰", color: "#22c55e" },
  { name: "Bonus", type: "INCOME" as const, icon: "💵", color: "#16a34a" },
  { name: "Hadiah", type: "INCOME" as const, icon: "🎁", color: "#15803d" },
  { name: "Investasi", type: "INCOME" as const, icon: "📈", color: "#14532d" },
  { name: "Freelance", type: "INCOME" as const, icon: "💼", color: "#4ade80" },

  // Expense categories
  { name: "Makanan & Minuman", type: "EXPENSE" as const, icon: "🍔", color: "#ef4444" },
  { name: "Transportasi", type: "EXPENSE" as const, icon: "🚗", color: "#f97316" },
  { name: "Belanja", type: "EXPENSE" as const, icon: "🛒", color: "#eab308" },
  { name: "Tagihan & Utilitas", type: "EXPENSE" as const, icon: "💡", color: "#3b82f6" },
  { name: "Hiburan", type: "EXPENSE" as const, icon: "🎮", color: "#8b5cf6" },
  { name: "Kesehatan", type: "EXPENSE" as const, icon: "🏥", color: "#ec4899" },
  { name: "Pendidikan", type: "EXPENSE" as const, icon: "📚", color: "#06b6d4" },
  { name: "Rumah Tangga", type: "EXPENSE" as const, icon: "🏠", color: "#f59e0b" },
];

/**
 * Creates default categories for a user
 * Call this function after user registration
 */
export async function createDefaultCategories(userId: string) {
  const categoriesToInsert = DEFAULT_CATEGORIES.map((cat) => ({
    userId,
    name: cat.name,
    type: cat.type,
    icon: cat.icon,
    color: cat.color,
    isDefault: true,
  }));

  return db.insert(categories).values(categoriesToInsert);
}
