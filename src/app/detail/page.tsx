import { Badge, Stack, Text, Title } from '@mantine/core';
import { TEXT_COLOR } from '@/config/color';
import getSessionEmail from '@/utils/get-session-email';
import DetailTable from './detail-table';
import MainCard from '../components/main-card';
import getTotalBalance from '../actions/get-total-balance';
import AccessBlocked from '../components/access-blocked';

export default async function Page() {
  const email = await getSessionEmail();

  if (!email) {
    return <AccessBlocked />;
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
