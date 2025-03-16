import { getTransaction } from '@/app/actions/db/transaction';
import { Category, Pocket, Transaction } from '@prisma/client';
import RecentTransactionTableClient from './client';

export default async function RecentTransactionTable({
  email,
}: {
  email: string;
}) {
  const transactions = (await getTransaction({
    email,
    options: {
      category: true,
      pocket: true,
      pocketDestination: true,
      pocketSource: true,
    },
  })) as (Transaction & {
    Category: Category;
    Pocket: Pocket;
    PocketSource: Pocket;
    PocketDestination: Pocket;
  })[];

  const transactionsForTable = transactions
    .slice(0, 5)
    .map((transaction, index) => ({
      no: index + 1,
      ...transaction,
    }));

  return <RecentTransactionTableClient transactions={transactionsForTable} />;
}
