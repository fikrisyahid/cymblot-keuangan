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

  const categories = (await getCategory({ email })) as Category[];
  const pockets = (await getPocket({ email })) as Pocket[];
  const transaction = (await getTransaction({
    email,
    id: id as string,
  })) as Transaction;

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
        <Title className="text-center">
          Detail Data Keuangan
        </Title>
      </div>
      <EditTransactionForm
        email={email}
        transaction={transaction}
        categories={categories}
        pockets={pockets}
      />
    </MainCard>
  );
}
