import { getCategory } from '@/app/actions/db/category';
import { getPocket } from '@/app/actions/db/pocket';
import { getTransaction } from '@/app/actions/db/transaction';
import { Category, Pocket, Transaction } from '@prisma/client';
import DetailChartClient from './client';

export default async function DetailChart({ email }: { email: string }) {
  const [transactions, pockets, categories] = await Promise.all([
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
    getPocket({ email }) as Promise<Pocket[]>,
    getCategory({ email }) as Promise<Category[]>,
  ]);

  return (
    <DetailChartClient
      transactions={transactions}
      pockets={pockets}
      categories={categories}
    />
  );
}
