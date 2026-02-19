import { Suspense } from "react";
import { getTransactionsPaginated } from "@/app/actions/transactions";
import { getTransfersPaginated } from "@/app/actions/transfers";
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

  const isTransferFilter = searchParams.type === "TRANSFER";

  const txFilters = {
    type: isTransferFilter ? undefined : (searchParams.type as "INCOME" | "EXPENSE" | undefined),
    accountId: searchParams.accountId || undefined,
    categoryId: searchParams.categoryId || undefined,
    startDate: searchParams.startDate
      ? new Date(searchParams.startDate)
      : undefined,
    endDate: searchParams.endDate ? new Date(searchParams.endDate) : undefined,
    search: searchParams.search || undefined,
  };

  const trFilters = {
    accountId: searchParams.accountId || undefined,
    startDate: searchParams.startDate
      ? new Date(searchParams.startDate)
      : undefined,
    endDate: searchParams.endDate ? new Date(searchParams.endDate) : undefined,
    search: searchParams.search || undefined,
  };

  // When filtering by TRANSFER, skip transactions; when filtering by INCOME/EXPENSE, skip transfers
  const shouldFetchTx = !isTransferFilter;
  const shouldFetchTr = !searchParams.type || isTransferFilter;

  const [paginatedTransactions, paginatedTransfers, accounts, categories] = await Promise.all([
    shouldFetchTx
      ? getTransactionsPaginated(txFilters, { page, perPage })
      : Promise.resolve({ data: [], total: 0, page: 1, perPage: 15, totalPages: 0 }),
    shouldFetchTr
      ? getTransfersPaginated(trFilters, { page, perPage })
      : Promise.resolve({ data: [], total: 0, page: 1, perPage: 15, totalPages: 0 }),
    getAccounts(),
    getCategories(),
  ]);

  const totalItems = paginatedTransactions.total + paginatedTransfers.total;

  return (
    <TransactionsClient
      transactions={paginatedTransactions.data}
      transfers={paginatedTransfers.data}
      accounts={accounts}
      categories={categories}
      pagination={{
        page,
        perPage,
        total: totalItems,
        totalPages: Math.ceil(totalItems / perPage),
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
