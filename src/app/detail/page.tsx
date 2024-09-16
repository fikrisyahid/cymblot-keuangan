import { Badge, Stack, Text, Title } from '@mantine/core';
import { TEXT_COLOR } from '@/config/color';
import { currentUser } from '@clerk/nextjs/server';
import DetailTable from './detail-table';
import MainCard from '../components/main-card';
import { getTotalBalance } from '../actions/transactions';

export default async function Page() {
  const user = await currentUser();
  const email = user?.emailAddresses[0].emailAddress;

  if (!email) {
    return <div>Anda harus login terlebih dahulu</div>;
  }

  const userBalance = await getTotalBalance({ email });

  return (
    <MainCard>
      <Title c={TEXT_COLOR} className="text-center sm:text-left">
        Detail Keuangan
      </Title>
      <Stack gap={0}>
        <Text>Total Saldo :</Text>
        <Badge color="teal">Rp. {userBalance}</Badge>
      </Stack>
      <DetailTable />
    </MainCard>
  );
}
