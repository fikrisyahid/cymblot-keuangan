import { getCategory } from '@/app/actions/db/category';
import { getPocket } from '@/app/actions/db/pocket';
import AccessBlocked from '@/app/components/access-blocked';
import FailedState from '@/app/components/failed-state';
import MainCard from '@/app/components/main-card';
import { BUTTON_BASE_COLOR } from '@/config/color';
import getSessionEmail from '@/utils/get-session-email';
import { Button, Title } from '@mantine/core';
import { Category, Pocket, Transaction } from '@prisma/client';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { getTransaction } from '@/app/actions/db/transaction';
import EditTransactionForm from './form';

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const email = await getSessionEmail();

  if (!email) {
    return <AccessBlocked />;
  }

  const transactions = (await getTransaction({
    email,
    options: {
      category: true,
      pocket: true,
    },
  })) as (Transaction & { Category: Category; Pocket: Pocket })[];
  const selectedTransaction = transactions.find(
    (t) => t.id === id,
  ) as Transaction;
  const categories = (await getCategory({
    email,
    options: {
      orderBy: {
        createdAt: 'desc',
      },
    },
  })) as Category[];
  const pockets = (await getPocket({
    email,
    options: {
      orderBy: {
        createdAt: 'desc',
      },
    },
  })) as Pocket[];

  const recentCategories = transactions
    .map((transaction) => transaction?.Category)
    .filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
  const sortedCategories = recentCategories.concat(
    categories.filter(
      (category) => !recentCategories.some((t) => t.id === category.id),
    ),
  );

  const recentPockets = transactions
    .filter((transaction) => transaction.type !== 'TRANSFER')
    .map((transaction) => transaction.Pocket)
    .filter(
      (transaction, index, self) =>
        index === self.findIndex((t) => t.id === transaction.id),
    );
  const sortedPockets = recentPockets.concat(
    pockets.filter((pocket) => !recentPockets.some((t) => t.id === pocket.id)),
  );

  if (!categories || !pockets) {
    return <FailedState />;
  }

  return (
    <MainCard>
      <div className="flex flex-col sm:items-center sm:flex-row justify-center sm:justify-start gap-2">
        <Button
          leftSection={<IconArrowLeft />}
          color={BUTTON_BASE_COLOR}
          component={Link}
          href="/detail"
        >
          Kembali
        </Button>
        <Title className="text-center">Detail Data Keuangan</Title>
      </div>
      <EditTransactionForm
        email={email}
        transaction={selectedTransaction}
        categories={sortedCategories}
        pockets={sortedPockets}
      />
    </MainCard>
  );
}
