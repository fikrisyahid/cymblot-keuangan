import { Suspense } from "react";
import { getTransactionsPaginated, getTransactions } from "@/app/actions/transactions";
import { getTransfersPaginated, getTransfers } from "@/app/actions/transfers";
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
  const isTypeFiltered = !!searchParams.type;

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
  const shouldFetchTr = !isTypeFiltered || isTransferFilter;
  const needUnifiedPagination = shouldFetchTx && shouldFetchTr;

  const [accounts, categories] = await Promise.all([
    getAccounts(),
    getCategories(),
  ]);

  if (needUnifiedPagination) {
    // Fetch all from both sources, merge by date, then paginate in JS
    // This avoids the "each source paginates independently" bug
    const [allTransactions, allTransfers] = await Promise.all([
      getTransactions(txFilters),
      getTransfers(trFilters),
    ]);

    type MergedItem =
      | { kind: "transaction"; date: Date; createdAt: Date; data: (typeof allTransactions)[0] }
      | { kind: "transfer"; date: Date; createdAt: Date; data: (typeof allTransfers)[0] };

    const merged: MergedItem[] = [
      ...allTransactions.map((t) => ({
        kind: "transaction" as const,
        date: t.date,
        createdAt: t.createdAt,
        data: t,
      })),
      ...allTransfers.map((t) => ({
        kind: "transfer" as const,
        date: t.date,
        createdAt: t.createdAt,
        data: t,
      })),
    ].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = merged.length;
    const offset = (page - 1) * perPage;
    const paged = merged.slice(offset, offset + perPage);

    return (
      <TransactionsClient
        transactions={paged.filter((i) => i.kind === "transaction").map((i) => i.data as (typeof allTransactions)[0])}
        transfers={paged.filter((i) => i.kind === "transfer").map((i) => i.data as (typeof allTransfers)[0])}
        accounts={accounts}
        categories={categories}
        pagination={{
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage),
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

  // Single-source: one of them is skipped, SQL pagination works correctly
  const [paginatedTransactions, paginatedTransfers] = await Promise.all([
    shouldFetchTx
      ? getTransactionsPaginated(txFilters, { page, perPage })
      : Promise.resolve({ data: [], total: 0, page: 1, perPage: 15, totalPages: 0 }),
    shouldFetchTr
      ? getTransfersPaginated(trFilters, { page, perPage })
      : Promise.resolve({ data: [], total: 0, page: 1, perPage: 15, totalPages: 0 }),
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
