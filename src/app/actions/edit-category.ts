'use server';

import prisma from '@/utils/db';
import revalidateAllRoute from './revalidate';

export default async function editCategory({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  await prisma.category.update({
    data: {
      name,
    },
    where: {
      id,
    },
  });
  revalidateAllRoute();
}
