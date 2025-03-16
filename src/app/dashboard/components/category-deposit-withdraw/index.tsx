import { getCategory } from '@/app/actions/db/category';
import { getTransaction } from '@/app/actions/db/transaction';
import getCategoryBalance from '@/app/actions/functions/get-category-balance';
import { Alert, Button, Stack, Text } from '@mantine/core';
import { Category, Pocket, Transaction } from '@prisma/client';
import { IconInfoCircle } from '@tabler/icons-react';
import Link from 'next/link';
import CategoryDepositWithdrawClient from './client';

export default async function CategoryDepositWithdraw({
  categoryMode = 'month',
  categorySort = 'all',
  email,
}: {
  categoryMode: 'day' | 'week' | 'month' | 'year' | 'all';
  categorySort: 'deposit' | 'withdraw' | 'all';
  email: string;
}) {
  const categories = (await getCategory({ email })) as Category[];
  const transactions = (await getTransaction({
    email,
    options: {
      category: true,
      pocket: true,
      pocketDestination: true,
      pocketSource: true,
    },
  })) as (Transaction & {
    Category: Category;
    Pocket: Pocket;
    PocketSource: Pocket;
    PocketDestination: Pocket;
  })[];

  const categoriesWithDepositAndWithdraw = categories
    .map((category) => ({
      ...category,
      deposit: getCategoryBalance({
        id: category.id,
        transactions,
        categoryMode,
        type: 'DEPOSIT',
      }),
      withdraw: getCategoryBalance({
        id: category.id,
        transactions,
        categoryMode,
        type: 'WITHDRAW',
      }),
    }))
    .sort((a, b) => {
      if (categorySort === 'deposit') {
        return b.deposit - a.deposit;
      }
      if (categorySort === 'withdraw') {
        return b.withdraw - a.withdraw;
      }
      return (b.deposit + b.withdraw) / 2 - (a.deposit + a.withdraw) / 2;
    })
    .slice(0, 5);

  if (categoriesWithDepositAndWithdraw.length === 0) {
    return (
      <Alert
        variant="filled"
        color="indigo"
        title="Info"
        icon={<IconInfoCircle />}
        p="xs"
        w="100%"
      >
        <Stack align="start">
          <Text c="white">
            Anda belum memiliki kategori. Silakan tambahkan kategori terlebih
            dahulu
          </Text>
          <Button component={Link} href="/category" color="teal">
            Tambah Kategori
          </Button>
        </Stack>
      </Alert>
    );
  }
  return (
    <CategoryDepositWithdrawClient
      categoryMode={categoryMode}
      categorySort={categorySort}
      categoriesWithDepositAndWithdraw={categoriesWithDepositAndWithdraw}
    />
  );
}
