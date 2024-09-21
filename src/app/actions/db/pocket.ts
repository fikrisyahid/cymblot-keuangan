'use server';

import prisma from '@/utils/db';
import revalidateAllRoute from '../revalidate';

async function getPocket({ id, email }: { id?: string; email: string }) {
  // Get pocket by id
  if (id) {
    const pocket = await prisma.pocket.findFirst({
      where: {
        id,
        email,
      },
    });
    return pocket;
  }

  // Get all pockets
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

export { getPocket, addPocket, editPocket, deletePocket };
