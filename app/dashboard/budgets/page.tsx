import { getBudgetsWithSpending } from "@/app/actions/budgets";
import { getCategories } from "@/app/actions/categories";
import { BudgetsClient } from "./client";

export default async function BudgetsPage() {
  const [budgets, categories] = await Promise.all([
    getBudgetsWithSpending(),
    getCategories(),
  ]);

  return <BudgetsClient budgets={budgets} categories={categories} />;
}
