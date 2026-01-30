import { getTransactions } from "@/app/actions/transactions";
import { getAccounts } from "@/app/actions/accounts";
import { getCategories } from "@/app/actions/categories";
import { TransactionsClient } from "./client";

export default async function TransactionsPage() {
  const [transactions, accounts, categories] = await Promise.all([
    getTransactions(),
    getAccounts(),
    getCategories(),
  ]);

  return (
    <TransactionsClient
      transactions={transactions}
      accounts={accounts}
      categories={categories}
    />
  );
}
