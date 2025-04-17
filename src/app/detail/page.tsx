import { Stack, Text, Title } from '@mantine/core';
import getSessionEmail from '@/utils/get-session-email';
import { Suspense } from 'react';
import DetailTable from './components/detail-table';
import MainCard from '../../components/main-card';
import AccessBlocked from '../../components/access-blocked';
import DetailTableSkeleton from './components/detail-table/skeleton';

export const metadata = {
  title: 'Detail Keuangan',
};

export default async function Page() {
  const email = await getSessionEmail();

  if (!email) {
    return <AccessBlocked />;
  }

  return (
    <MainCard>
      <Stack gap={0} className="text-center sm:text-left">
        <Title>Daftar Keuangan</Title>
        <Text>Pantau detail semua transaksi keuangan Anda di sini</Text>
      </Stack>
      <Suspense fallback={<DetailTableSkeleton />}>
        <DetailTable email={email} />
      </Suspense>
    </MainCard>
  );
}
