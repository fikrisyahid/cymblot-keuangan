'use server';

import prisma from '@/utils/db';
import { cache } from 'react';
import revalidateAllRoute from '../revalidate';

// Updated getCategory:
const getCategory = cache(
  async ({
    id,
    email,
    options = { orderBy: { name: 'asc' } },
  }: {
    id?: string;
    email: string;
    options?: {
      orderBy?: { name?: 'asc' | 'desc'; createdAt?: 'asc' | 'desc' };
    };
  }) => {
    // Get category by id
    if (id) {
      const category = await prisma.category.findFirst({
        where: { id, email },
      });
      return category;
    }

    // Get all categories
    const categories = await prisma.category.findMany({
      where: { email },
      orderBy: {
        name: options?.orderBy?.name,
        createdAt: options?.orderBy?.createdAt,
      },
    });
    return categories;
  },
);

// Updated addCategory:
const addCategory = cache(
  async ({ email, name }: { email: string; name: string }) => {
    await prisma.category.create({ data: { name, email } });
    revalidateAllRoute();
  },
);

// Updated editCategory:
const editCategory = cache(
  async ({ id, name }: { id: string; name: string }) => {
    await prisma.category.update({ data: { name }, where: { id } });
    revalidateAllRoute();
  },
);

// Updated deleteCategory:
const deleteCategory = cache(async ({ id }: { id: string }) => {
  await prisma.category.delete({ where: { id } });
  revalidateAllRoute();
});

export { getCategory, addCategory, editCategory, deleteCategory };
