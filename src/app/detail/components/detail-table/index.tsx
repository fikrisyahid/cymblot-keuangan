import { getTransaction } from '@/app/actions/db/transaction';
import { Category, Pocket, Transaction } from '@prisma/client';
import { getCategory } from '@/app/actions/db/category';
import { getPocket } from '@/app/actions/db/pocket';
import DetailTableClient from './client';

export default async function DetailTable({ email }: { email: string }) {
  const [transactions, categories, pockets] = await Promise.all([
    getTransaction({
      email,
      options: {
        category: true,
        pocket: true,
        pocketSource: true,
        pocketDestination: true,
      },
    }) as Promise<
      (Transaction & {
        Category: Category;
        Pocket: Pocket;
        PocketSource: Pocket;
        PocketDestination: Pocket;
      })[]
    >,
    getCategory({ email }) as Promise<Category[]>,
    getPocket({ email }) as Promise<Pocket[]>,
  ]);

  const transactionsForTable = transactions.map((transaction, index) => ({
    no: index + 1,
    ...transaction,
  }));

  return (
    <DetailTableClient
      transactions={transactionsForTable}
      categories={categories}
      pockets={pockets}
    />
  );
}
