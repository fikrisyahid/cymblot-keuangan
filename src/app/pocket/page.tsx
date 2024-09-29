import { Stack, Text, Title } from '@mantine/core';
import getSessionEmail from '@/utils/get-session-email';
import getEnvironmentMode from '@/utils/get-environment-mode';
import { Pocket } from '@prisma/client';
import MainCard from '../components/main-card';
import PocketTable from './table';
import PrettyJSON from '../components/pretty-json';
import AccessBlocked from '../components/access-blocked';
import { getPocket } from '../actions/db/pocket';
import FailedState from '../components/failed-state';
import AddPocketPopup from '../components/functions/add-pocket-popup';

export default async function Page() {
  const email = await getSessionEmail();

  if (!email) {
    return <AccessBlocked />;
  }

  const pockets = (await getPocket({ email })) as Pocket[];

  if (!pockets) {
    return <FailedState />;
  }

  const isDev = getEnvironmentMode() === 'development';

  const pocketsForTable = pockets.map((pocket, index) => ({
    id: pocket.id,
    no: index + 1,
    name: pocket.name,
  }));

  return (
    <MainCard>
      <Stack gap={0} className="text-center sm:text-left">
        <Title>Daftar Kantong</Title>
        <Text>
          Semua tempat penyimpanan uang Anda seperti akun bank, cash, atau
          e-wallet untuk memantau saldo secara keseluruhan
        </Text>
      </Stack>
      <AddPocketPopup
        pockets={pockets}
        email={email}
        className="sm:self-end"
      />
      <PocketTable pockets={pocketsForTable} />
      {isDev && <PrettyJSON content={pockets} />}
    </MainCard>
  );
}
