import { Suspense } from "react";
import { getTransactionsPaginated } from "@/app/actions/transactions";
import { getAccounts } from "@/app/actions/accounts";
import { getCategories } from "@/app/actions/categories";
import { TransactionsClient } from "./client";
import CustomLoadingOverlay from "@/components/custom-loading-overlay";

interface SearchParams {
  page?: string;
  perPage?: string;
  type?: string;
  accountId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

async function TransactionsContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = parseInt(searchParams.page || "1");
  const perPage = parseInt(searchParams.perPage || "15");

  const filters = {
    type: searchParams.type as "INCOME" | "EXPENSE" | undefined,
    accountId: searchParams.accountId || undefined,
    categoryId: searchParams.categoryId || undefined,
    startDate: searchParams.startDate
      ? new Date(searchParams.startDate)
      : undefined,
    endDate: searchParams.endDate ? new Date(searchParams.endDate) : undefined,
    search: searchParams.search || undefined,
  };

  const [paginatedTransactions, accounts, categories] = await Promise.all([
    getTransactionsPaginated(filters, { page, perPage }),
    getAccounts(),
    getCategories(),
  ]);

  return (
    <TransactionsClient
      transactions={paginatedTransactions.data}
      accounts={accounts}
      categories={categories}
      pagination={{
        page: paginatedTransactions.page,
        perPage: paginatedTransactions.perPage,
        total: paginatedTransactions.total,
        totalPages: paginatedTransactions.totalPages,
      }}
      currentFilters={{
        type: searchParams.type || "",
        accountId: searchParams.accountId || "",
        categoryId: searchParams.categoryId || "",
        startDate: searchParams.startDate || "",
        endDate: searchParams.endDate || "",
        search: searchParams.search || "",
      }}
    />
  );
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={<CustomLoadingOverlay />}>
      <TransactionsContent searchParams={params} />
    </Suspense>
  );
}
