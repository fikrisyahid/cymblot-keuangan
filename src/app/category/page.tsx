import { Stack, Text, Title } from '@mantine/core';
import getSessionEmail from '@/utils/get-session-email';
import { Suspense } from 'react';
import MainCard from '../components/main-card';
import AccessBlocked from '../components/access-blocked';
import CategoryTableSkeleton from './components/category-table/skeleton';
import CategoryTable from './components/category-table';

export const metadata = {
  title: 'Kategori',
};

export default async function Page() {
  const email = await getSessionEmail();

  if (!email) {
    return <AccessBlocked />;
  }

  return (
    <MainCard>
      <Stack gap={0} className="text-center sm:text-left">
        <Title>Daftar Kategori</Title>
        <Text>
          Kelompokkan pengeluaran dan pemasukan berdasarkan kategori yang
          memudahkan manajemen keuangan Anda
        </Text>
      </Stack>
      <Suspense fallback={<CategoryTableSkeleton />}>
        <CategoryTable email={email} />
      </Suspense>
    </MainCard>
  );
}
