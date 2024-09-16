import { Button, Title } from '@mantine/core';
import { BUTTON_BASE_COLOR, TEXT_COLOR } from '@/config/color';
import getSessionEmail from '@/utils/get-session-email';
import getEnvironmentMode from '@/utils/get-environment-mode';
import { IconPlus } from '@tabler/icons-react';
import MainCard from '../components/main-card';
import CategoryTable from './category-table';
import getCategories from '../actions/get-categories';
import PrettyJSON from '../components/pretty-json';
import AccessBlocked from '../components/access-blocked';

export default async function Page() {
  const email = await getSessionEmail();

  if (!email) {
    return <AccessBlocked />;
  }

  const categories = await getCategories({ email });

  const isDev = getEnvironmentMode() === 'development';

  return (
    <MainCard>
      <Title c={TEXT_COLOR} className="text-center sm:text-left">
        Daftar Kategori
      </Title>
      <Button
        leftSection={<IconPlus />}
        color={BUTTON_BASE_COLOR}
        className="self-center w-full sm:w-auto sm:self-end"
      >
        Tambah Kategori
      </Button>
      <CategoryTable />
      {isDev && <PrettyJSON content={categories} />}
    </MainCard>
  );
}
