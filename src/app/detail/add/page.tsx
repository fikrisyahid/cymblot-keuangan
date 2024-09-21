import MainCard from '@/app/components/main-card';
import { BUTTON_BASE_COLOR, TEXT_COLOR } from '@/config/color';
import { Button, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import getSessionEmail from '@/utils/get-session-email';
import AccessBlocked from '@/app/components/access-blocked';
import { getCategory } from '@/app/actions/db/category';
import { getPocket } from '@/app/actions/db/pocket';
import FailedState from '@/app/components/failed-state';
import { Category, Pocket } from '@prisma/client';
import AddTransactionForm from './form';

export default async function Page() {
  const email = await getSessionEmail();

  if (!email) {
    return <AccessBlocked />;
  }

  const categories = (await getCategory({ email })) as Category[];
  const pockets = (await getPocket({ email })) as Pocket[];

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
        <Title c={TEXT_COLOR} className="text-center">
          Tambah Data Keuangan
        </Title>
      </div>
      <AddTransactionForm
        email={email}
        categories={categories}
        pockets={pockets}
      />
    </MainCard>
  );
}
