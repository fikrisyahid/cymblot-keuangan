'use server';

import prisma from '@/utils/db';
import revalidateAllRoute from '../revalidate';

async function getPockets({ email }: { email: string }) {
  const pockets = await prisma.pocket.findMany({
    where: {
      email,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return pockets;
}

async function addPocket({ email, name }: { email: string; name: string }) {
  await prisma.pocket.create({
    data: {
      name,
      email,
    },
  });
  revalidateAllRoute();
}

async function editPocket({ id, name }: { id: string; name: string }) {
  await prisma.pocket.update({
    data: {
      name,
    },
    where: {
      id,
    },
  });
  revalidateAllRoute();
}

async function deletePocket({ id }: { id: string }) {
  await prisma.pocket.delete({
    where: {
      id,
    },
  });
  revalidateAllRoute();
}

export { getPockets, addPocket, editPocket, deletePocket };
