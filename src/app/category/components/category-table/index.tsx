import { getCategory } from '@/app/actions/db/category';
import { Category } from '@prisma/client';
import AddCategoryPopup from '@/app/components/functions/add-category-popup';
import CategoryTableClient from './client';

export default async function CategoryTable({ email }: { email: string }) {
  const categories = (await getCategory({ email })) as Category[];

  const categoriesForTable = categories.map((category, index) => ({
    no: index + 1,
    ...category,
  }));

  return (
    <>
      <AddCategoryPopup
        email={email}
        categories={categories}
        className="sm:self-end"
      />
      <CategoryTableClient categories={categoriesForTable} />
    </>
  );
}
