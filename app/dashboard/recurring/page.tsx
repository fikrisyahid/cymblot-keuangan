import { getRecurringTransactions } from "@/app/actions/recurring";
import { getAccounts } from "@/app/actions/accounts";
import { getCategories } from "@/app/actions/categories";
import { RecurringClient } from "./client";

export default async function RecurringPage() {
  const [recurringTransactions, accounts, categories] = await Promise.all([
    getRecurringTransactions(),
    getAccounts(),
    getCategories(),
  ]);

  return (
    <RecurringClient
      recurringTransactions={recurringTransactions}
      accounts={accounts}
      categories={categories}
    />
  );
}
