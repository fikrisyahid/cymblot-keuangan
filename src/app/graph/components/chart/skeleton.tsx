import { NumberFormatter, Skeleton, Stack, Text } from '@mantine/core';

export default function DetailChartSkeleton() {
  return (
    <Stack>
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
      <Skeleton height={300} />
    </Stack>
  );
}
