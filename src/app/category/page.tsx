import { Title } from '@mantine/core';
import { TEXT_COLOR } from '@/config/color';
import getSessionEmail from '@/utils/get-session-email';
import getEnvironmentMode from '@/utils/get-environment-mode';
import MainCard from '../components/main-card';
import CategoryTable from './table';
import PrettyJSON from '../components/pretty-json';
import AccessBlocked from '../components/access-blocked';
import AddCategoryForm from './add-form';
import { getCategories } from '../actions/db/category';

export default async function Page() {
  const email = await getSessionEmail();

  if (!email) {
    return <AccessBlocked />;
  }

  const categories = await getCategories({ email });

  const isDev = getEnvironmentMode() === 'development';

  const categoriesForTable = categories.map((category, index) => ({
    id: category.id,
    no: index + 1,
    name: category.name,
  }));

  return (
    <MainCard>
      <Title c={TEXT_COLOR} className="text-center sm:text-left">
        Daftar Kategori
      </Title>
      <AddCategoryForm categories={categories} email={email} />
      <CategoryTable categories={categoriesForTable} />
      {isDev && <PrettyJSON content={categories} />}
    </MainCard>
  );
}
