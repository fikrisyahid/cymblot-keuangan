'use server';

import prisma from '@/utils/db';
import { Transaction } from '@prisma/client';

async function getTransaction({
  id,
  email,
  options,
}: {
  id?: string;
  email: string;
  options?: {
    pocket: boolean;
    category: boolean;
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
  categoryId,
}: {
  date: Date;
  email: string;
  value: number;
  information: string;
  type: Transaction['type'];
  pocketId: string;
  categoryId: string;
}) {
  const transaction = await prisma.transaction.create({
    data: {
      date,
      email,
      value,
      information,
      type,
      pocketId,
      categoryId,
    },
  });
  return transaction;
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
  const transaction = await prisma.transaction.update({
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
  return transaction;
}

async function deleteTransaction({ id }: { id: string }) {
  const transaction = await prisma.transaction.delete({
    where: {
      id,
    },
  });
  return transaction;
}

export { getTransaction, addTransaction, editTransaction, deleteTransaction };
