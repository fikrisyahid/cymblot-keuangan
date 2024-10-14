import MainCard from '@/app/components/main-card';
import { BUTTON_BASE_COLOR } from '@/config/color';
import { Button, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import getSessionEmail from '@/utils/get-session-email';
import AccessBlocked from '@/app/components/access-blocked';
import { getTransaction } from '@/app/actions/db/transaction';
import { getCategory } from '@/app/actions/db/category';
import { getPocket } from '@/app/actions/db/pocket';
import FailedState from '@/app/components/failed-state';
import { Category, Pocket, Transaction } from '@prisma/client';
import AddTransactionForm from './form';

export default async function Page() {
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
        <Title className="text-center">Tambah Data Keuangan</Title>
      </div>
      <AddTransactionForm
        email={email}
        categories={sortedCategories}
        pockets={sortedPockets}
      />
    </MainCard>
  );
}
