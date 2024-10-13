'use server';

import prisma from '@/utils/db';
import revalidateAllRoute from '../revalidate';
import getPocketBalance from '../functions/get-pocket-balance';

async function getPocket({
  id,
  email,
  withBalance,
}: {
  id?: string;
  email: string;
  withBalance?: boolean;
}) {
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
      name: 'asc',
    },
  });

  if (!withBalance) {
    return pockets;
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      email,
    },
  });

  const pocketsWithBalance = pockets.map((pocket) => ({
    ...pocket,
    balance: getPocketBalance({
      id: pocket.id,
      transactions,
    }),
  }));

  return pocketsWithBalance;
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
