'use server';

import prisma from '@/utils/db';
import revalidateAllRoute from '../revalidate';

async function getCategory({
  id,
  email,
  options = {
    orderBy: {
      name: 'asc',
    },
  },
}: {
  id?: string;
  email: string;
  options?: {
    orderBy?: {
      name?: 'asc' | 'desc';
      createdAt?: 'asc' | 'desc';
    };
  };
}) {
  // Get category by id
  if (id) {
    const category = await prisma.category.findFirst({
      where: {
        id,
        email,
      },
    });
    return category;
  }

  // Get all categories
  const categories = await prisma.category.findMany({
    where: {
      email,
    },
    orderBy: {
      name: options?.orderBy?.name,
      createdAt: options?.orderBy?.createdAt,
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

export { getCategory, addCategory, editCategory, deleteCategory };
