import { BUTTON_BASE_COLOR } from '@/config/color';
import {
  Button,
  NumberFormatter,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';

export default function DetailTableSkeleton() {
  return (
    <Stack gap="sm">
      <div className="flex flex-col w-full sm:justify-between sm:flex-row gap-2 mt-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-0 sm:gap-1 w-full sm:w-auto bg-primary p-2 rounded-md shadow-md">
            <Text c="white" size="sm">
              Selisih:{' '}
            </Text>
            <NumberFormatter
              prefix="Rp "
              value={0}
              thousandSeparator
              className="text-white text-sm font-bold"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-0 sm:gap-1 w-full sm:w-auto bg-[#4b9a41] p-2 rounded-md shadow-md">
            <Text c="white" size="sm">
              Pemasukan:{' '}
            </Text>
            <NumberFormatter
              prefix="Rp "
              value={0}
              thousandSeparator
              className="text-white text-sm font-bold"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-0 sm:gap-1 w-full sm:w-auto bg-red-500 p-2 rounded-md shadow-md">
            <Text c="white" size="sm">
              Pengeluaran:{' '}
            </Text>
            <NumberFormatter
              prefix="Rp "
              value={0}
              thousandSeparator
              className="text-white text-sm font-bold"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-0 sm:gap-1 w-full sm:w-auto bg-violet-600 p-2 rounded-md shadow-md">
            <Text c="white" size="sm">
              Transfer:{' '}
            </Text>
            <NumberFormatter
              prefix="Rp "
              value={0}
              thousandSeparator
              className="text-white text-sm font-bold"
            />
          </div>
        </div>
        <Button
          color={BUTTON_BASE_COLOR}
          leftSection={<IconPlus />}
          component={Link}
          href="/detail/add"
        >
          Tambah Data Keuangan
        </Button>
      </div>
      <TextInput placeholder="Cari data keseluruhan" />
      <Skeleton height={400} />
    </Stack>
  );
}
