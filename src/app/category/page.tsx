import { Stack, Text, Title } from '@mantine/core';
import { TEXT_COLOR } from '@/config/color';
import getSessionEmail from '@/utils/get-session-email';
import getEnvironmentMode from '@/utils/get-environment-mode';
import { Category } from '@prisma/client';
import MainCard from '../components/main-card';
import CategoryTable from './table';
import PrettyJSON from '../components/pretty-json';
import AccessBlocked from '../components/access-blocked';
import AddCategoryForm from './add-form';
import { getCategory } from '../actions/db/category';
import FailedState from '../components/failed-state';

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
        <Title c={TEXT_COLOR}>Daftar Kategori</Title>
        <Text>
          Kelompokkan pengeluaran dan pemasukan berdasarkan kategori yang
          memudahkan manajemen keuangan Anda
        </Text>
      </Stack>
      <AddCategoryForm categories={categories} email={email} />
      <CategoryTable categories={categoriesForTable} />
      {isDev && <PrettyJSON content={categories} />}
    </MainCard>
  );
}
