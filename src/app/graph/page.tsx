import { Stack, Text, Title } from '@mantine/core';
import getSessionEmail from '@/utils/get-session-email';
import { Suspense } from 'react';
import MainCard from '../../components/main-card';
import AccessBlocked from '../../components/access-blocked';
import DetailChart from './components/chart';
import DetailChartSkeleton from './components/chart/skeleton';

export const metadata = {
  title: 'Grafik Keuangan',
};

export default async function Page() {
  const email = await getSessionEmail();

  if (!email) {
    return <AccessBlocked />;
  }

  return (
    <MainCard transparent noPadding>
      <MainCard>
        <Stack gap={0} className="text-center sm:text-start">
          <Title>Visualisasi Data Keuangan</Title>
          <Text>Monitor trend data keuangan anda</Text>
        </Stack>
        <Suspense fallback={<DetailChartSkeleton />}>
          <DetailChart email={email} />
        </Suspense>
      </MainCard>
    </MainCard>
  );
}
