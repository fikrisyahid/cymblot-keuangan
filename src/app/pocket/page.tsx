import { Title } from '@mantine/core';
import { TEXT_COLOR } from '@/config/color';
import getSessionEmail from '@/utils/get-session-email';
import getEnvironmentMode from '@/utils/get-environment-mode';
import MainCard from '../components/main-card';
import PocketTable from './table';
import PrettyJSON from '../components/pretty-json';
import AccessBlocked from '../components/access-blocked';
import AddPocketForm from './add-form';
import { getPockets } from '../actions/db/pocket';

export default async function Page() {
  const email = await getSessionEmail();

  if (!email) {
    return <AccessBlocked />;
  }

  const pockets = await getPockets({ email });

  const isDev = getEnvironmentMode() === 'development';

  const pocketsForTable = pockets.map((pocket, index) => ({
    id: pocket.id,
    no: index + 1,
    name: pocket.name,
  }));

  return (
    <MainCard>
      <Title c={TEXT_COLOR} className="text-center sm:text-left">
        Daftar Kantong
      </Title>
      <AddPocketForm pockets={pockets} email={email} />
      <PocketTable pockets={pocketsForTable} />
      {isDev && <PrettyJSON content={pockets} />}
    </MainCard>
  );
}
