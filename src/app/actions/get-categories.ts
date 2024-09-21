'use server';

import prisma from '@/utils/db';

export default async function getCategories({ email }: { email: string }) {
  const categories = await prisma.category.findMany({
    where: {
      email,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return categories;
}
