'use server';

import prisma from '@/utils/db';
import { Transaction } from '@prisma/client';
import getPocketBalance from '../functions/get-pocket-balance';
import revalidateAllRoute from '../revalidate';

async function getTransaction({
  id,
  email,
  options,
}: {
  id?: string;
  email: string;
  options?: {
    pocket?: boolean;
    category?: boolean;
    pocketSource?: boolean;
    pocketDestination?: boolean;
  };
}) {
  // Get transaction by id
  if (id) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        email,
      },
    });
    return transaction;
  }

  // Get all transactions
  const transactions = await prisma.transaction.findMany({
    where: {
      email,
    },
    orderBy: {
      date: 'desc',
    },
    include: {
      Pocket: options?.pocket,
      Category: options?.category,
      PocketSource: options?.pocketSource,
      PocketDestination: options?.pocketDestination,
    },
  });
  return transactions;
}

async function addTransaction({
  email,
  date,
  information,
  type,
  value,
  pocketId,
  pocketSourceId,
  pocketDestinationId,
  categoryId,
}: {
  date: Date;
  email: string;
  value: number;
  information: string;
  type: Transaction['type'];
  pocketId?: string;
  pocketSourceId?: string;
  pocketDestinationId?: string;
  categoryId: string;
}) {
  // Check balance from pocket
  if (type !== 'DEPOSIT') {
    const minimalPocketBalance = await getPocketBalance({
      id:
        type === 'TRANSFER' ? (pocketSourceId as string) : (pocketId as string),
    });
    const checkedPocket = await prisma.pocket.findFirst({
      where: {
        id: type === 'TRANSFER' ? pocketSourceId : pocketId,
      },
    });
    if (minimalPocketBalance < value) {
      throw new Error(`Saldo kantong ${checkedPocket?.name} tidak mencukupi`);
    }
  }

  const pocketOptions =
    type !== 'TRANSFER'
      ? {
          pocketId,
        }
      : {
          pocketSourceId,
          pocketDestinationId,
        };
  await prisma.transaction.create({
    data: {
      date,
      email,
      value,
      information,
      type,
      categoryId,
      ...pocketOptions,
    },
  });
  revalidateAllRoute();
}

async function editTransaction({
  id,
  date,
  information,
  type,
  value,
  pocketId,
  categoryId,
}: {
  id: string;
  date: Date;
  value: number;
  information: string;
  type: Transaction['type'];
  pocketId: string;
  categoryId: string;
}) {
  await prisma.transaction.update({
    where: {
      id,
    },
    data: {
      date,
      value,
      information,
      type,
      pocketId,
      categoryId,
    },
  });
  revalidateAllRoute();
}

async function deleteTransaction({ id }: { id: string }) {
  await prisma.transaction.delete({
    where: {
      id,
    },
  });
  revalidateAllRoute();
}

export { getTransaction, addTransaction, editTransaction, deleteTransaction };
