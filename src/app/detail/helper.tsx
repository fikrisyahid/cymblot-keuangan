import convertTransactionType from '@/utils/convert-transaction-type';
import {
  ActionIcon,
  Badge,
  Button,
  MultiSelect,
  NumberFormatter,
  NumberInput,
  rem,
  Stack,
  TextInput,
} from '@mantine/core';
import {
  IconArrowNarrowDown,
  IconCalendar,
  IconPencil,
} from '@tabler/icons-react';
import Link from 'next/link';
import { DataTableColumn } from 'mantine-datatable';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { DatePickerInput } from '@mantine/dates';
import { BUTTON_BASE_COLOR } from '@/config/color';
import { Category, Pocket } from '@prisma/client';
import DeleteTransactionForm from './delete-form';
import { ITableFilter } from './interface';

function generateColumn({
  filter,
  handleChange,
  oldestTransactionDate,
  categories,
  pockets,
}: {
  filter: ITableFilter;
  handleChange: (newKeyValue: any) => void;
  oldestTransactionDate: Date;
  categories: Category[];
  pockets: Pocket[];
}): DataTableColumn<any>[] {
  dayjs.locale('id');

  return [
    {
      accessor: 'no',
      title: 'No.',
      sortable: true,
      width: 70,
    },
    {
      accessor: 'date',
      title: 'Tanggal',
      sortable: true,
      render: (record: any) =>
        dayjs(record.date).format('dddd, DD MMMM YYYY @HH:mm'),
      filter: (
        <Stack gap="sm">
          <DatePickerInput
            label="Tanggal terkecil"
            placeholder="Pilih tanggal terkecil"
            valueFormatter={({ date }) =>
              dayjs(date as Date).format('dddd, DD MMMM YYYY')
            }
            leftSection={
              <IconCalendar
                style={{ width: rem(18), height: rem(18) }}
                stroke={1.5}
              />
            }
            value={filter.date.start}
            onChange={(date) =>
              handleChange({
                date: {
                  ...filter.date,
                  start: dayjs(date as Date)
                    .startOf('day')
                    .toDate(),
                },
              })
            }
          />
          <DatePickerInput
            label="Tanggal terbesar"
            placeholder="Pilih tanggal terbesar"
            valueFormatter={({ date }) =>
              dayjs(date as Date).format('dddd, DD MMMM YYYY')
            }
            leftSection={
              <IconCalendar
                style={{ width: rem(18), height: rem(18) }}
                stroke={1.5}
              />
            }
            value={filter.date.end}
            onChange={(date) =>
              handleChange({
                date: {
                  ...filter.date,
                  end: dayjs(date as Date)
                    .endOf('day')
                    .toDate(),
                },
              })
            }
          />
          <Button
            color={BUTTON_BASE_COLOR}
            onClick={() =>
              handleChange({
                date: {
                  start: dayjs(oldestTransactionDate).startOf('day').toDate(),
                  end: dayjs().endOf('day').toDate(),
                },
              })
            }
          >
            Reset
          </Button>
        </Stack>
      ),
    },
    {
      accessor: 'information',
      title: 'Keterangan',
      sortable: true,
      filter: (
        <TextInput
          label="Keterangan"
          placeholder="Masukkan keterangan yang ingin dicari"
          value={filter.information}
          onChange={(e) => handleChange({ information: e.currentTarget.value })}
          style={{
            width: '400px',
          }}
        />
      ),
    },
    {
      accessor: 'type',
      title: 'Jenis',
      sortable: true,
      textAlign: 'center',
      render: (record: any) => {
        const typeFromDB = record?.type;
        const typeInID = convertTransactionType(typeFromDB);
        const color =
          typeInID === 'PEMASUKAN'
            ? 'teal'
            : typeInID === 'PENGELUARAN'
            ? 'red'
            : 'violet';
        return (
          <div className="flex justify-center">
            <Badge color={color} fullWidth>
              {typeInID}
            </Badge>
          </div>
        );
      },
      filter: (
        <MultiSelect
          clearable
          label="Jenis transaksi"
          placeholder="Pilih jenis transaksi"
          data={[
            { value: 'DEPOSIT', label: 'PEMASUKAN' },
            { value: 'WITHDRAW', label: 'PENGELUARAN' },
            { value: 'TRANSFER', label: 'TRANSFER' },
          ]}
          value={filter.type}
          onChange={(value) => handleChange({ type: value })}
        />
      ),
    },
    {
      accessor: 'value',
      title: 'Nominal',
      sortable: true,
      textAlign: 'right',
      render: (record: any) => (
        <div className="flex justify-end">
          <NumberFormatter
            prefix="Rp"
            value={record?.value}
            thousandSeparator
          />
        </div>
      ),
      filter: (
        <Stack>
          <NumberInput
            label="Batas bawah"
            description="Filter transaksi dengan nominal lebih besar dari atau sama dengan"
            thousandSeparator=","
            placeholder="Masukkan batas bawah"
            value={filter.value.min}
            prefix="Rp"
            allowNegative={false}
            onChange={(e) =>
              handleChange({ value: { ...filter.value, min: e } })
            }
          />
          <NumberInput
            label="Batas atas"
            description="Filter transaksi dengan nominal lebih kecil dari atau sama dengan"
            thousandSeparator=","
            placeholder="Masukkan batas atas"
            value={filter.value.max}
            prefix="Rp"
            allowNegative={false}
            onChange={(e) =>
              handleChange({ value: { ...filter.value, max: e } })
            }
          />
          <NumberInput
            label="Sama dengan"
            description="Filter transaksi dengan nominal sama dengan"
            thousandSeparator=","
            placeholder="Masukkan nominal"
            value={filter.value.equal}
            prefix="Rp"
            allowNegative={false}
            onChange={(e) =>
              handleChange({ value: { ...filter.value, equal: e } })
            }
          />
          <Button
            color={BUTTON_BASE_COLOR}
            onClick={() =>
              handleChange({
                value: {
                  min: '',
                  max: '',
                  equal: '',
                },
              })
            }
          >
            Reset
          </Button>
        </Stack>
      ),
    },
    {
      accessor: 'category',
      title: 'Kategori',
      sortable: true,
      render: (record: any) => record.Category?.name,
      filter: (
        <MultiSelect
          clearable
          label="Jenis kategori"
          placeholder="Pilih jenis kategori"
          data={categories.map((category) => ({
            value: category.id,
            label: category.name,
          }))}
          value={filter.category}
          onChange={(value) => handleChange({ category: value })}
        />
      ),
    },
    {
      accessor: 'pocket',
      title: 'Kantong',
      sortable: true,
      textAlign: 'center',
      render: (record: any) => {
        if (record.type === 'TRANSFER') {
          return (
            <Stack gap={0} align="center">
              <Badge fullWidth>{record.PocketSource?.name}</Badge>
              <IconArrowNarrowDown color="teal" />
              <Badge fullWidth>{record.PocketDestination?.name}</Badge>
            </Stack>
          );
        }
        return (
          <div className="flex justify-center">
            <Badge fullWidth>{record.Pocket?.name}</Badge>
          </div>
        );
      },
      filter: (
        <MultiSelect
          clearable
          label="Jenis kantong"
          placeholder="Pilih jenis kantong"
          data={pockets.map((pocket) => ({
            value: pocket.id,
            label: pocket.name,
          }))}
          value={filter.pocket}
          onChange={(value) => handleChange({ pocket: value })}
        />
      ),
    },
    {
      accessor: 'actions',
      title: 'Aksi',
      textAlign: 'right',
      width: 100,
      render: (record: any) => (
        <div className="flex flex-row justify-end gap-2">
          <ActionIcon
            variant="filled"
            component={Link}
            href={`/detail/${record.id}`}
            color="yellow"
          >
            <IconPencil style={{ width: '70%', height: '70%' }} stroke={1.5} />
          </ActionIcon>
          <DeleteTransactionForm selectedTransaction={record} />
        </div>
      ),
    },
  ];
}

export { generateColumn };
