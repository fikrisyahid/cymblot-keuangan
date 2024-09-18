'use server';

import prisma from '@/utils/db';
import revalidateAllRoute from './revalidate';

export default async function addCategory({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  await prisma.category.create({
    data: {
      name,
      email,
    },
  });
  revalidateAllRoute();
}
