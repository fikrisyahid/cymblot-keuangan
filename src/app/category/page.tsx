import { Stack, Text, Title } from '@mantine/core';
import getSessionEmail from '@/utils/get-session-email';
import getEnvironmentMode from '@/utils/get-environment-mode';
import { Category } from '@prisma/client';
import MainCard from '../components/main-card';
import CategoryTable from './table';
import PrettyJSON from '../components/pretty-json';
import AccessBlocked from '../components/access-blocked';
import { getCategory } from '../actions/db/category';
import FailedState from '../components/failed-state';
import AddCategoryPopup from '../components/functions/add-category-popup';

export default async function Page() {
  const email = await getSessionEmail();

  if (!email) {
    return <AccessBlocked />;
  }

  const categories = (await getCategory({ email })) as Category[];

  if (!categories) {
    return <FailedState />;
  }

  const isDev = getEnvironmentMode() === 'development';

  const categoriesForTable = categories.map((category, index) => ({
    id: category.id,
    no: index + 1,
    name: category.name,
  }));

  return (
    <MainCard>
      <Stack gap={0} className="text-center sm:text-left">
        <Title>Daftar Kategori</Title>
        <Text>
          Kelompokkan pengeluaran dan pemasukan berdasarkan kategori yang
          memudahkan manajemen keuangan Anda
        </Text>
      </Stack>
      <AddCategoryPopup
        email={email}
        categories={categories}
        className="sm:self-end bg-baseButton"
      />
      <CategoryTable categories={categoriesForTable} />
      {isDev && <PrettyJSON content={categories} />}
    </MainCard>
  );
}
