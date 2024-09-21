'use server';

import prisma from '@/utils/db';
import revalidateAllRoute from '../revalidate';

async function getCategories({ email }: { email: string }) {
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

async function addCategory({ email, name }: { email: string; name: string }) {
  await prisma.category.create({
    data: {
      name,
      email,
    },
  });
  revalidateAllRoute();
}

async function editCategory({ id, name }: { id: string; name: string }) {
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

async function deleteCategory({ id }: { id: string }) {
  await prisma.category.delete({
    where: {
      id,
    },
  });
  revalidateAllRoute();
}

export { getCategories, addCategory, editCategory, deleteCategory };
