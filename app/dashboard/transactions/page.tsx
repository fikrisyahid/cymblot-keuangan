import { Suspense } from "react";
import { getTransactions } from "@/app/actions/transactions";
import { getAccounts } from "@/app/actions/accounts";
import { getCategories } from "@/app/actions/categories";
import { TransactionsClient } from "./client";
import CustomLoadingOverlay from "@/components/custom-loading-overlay";

async function TransactionsContent() {
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

export default function TransactionsPage() {
  return (
    <Suspense fallback={<CustomLoadingOverlay />}>
      <TransactionsContent />
    </Suspense>
  );
}
