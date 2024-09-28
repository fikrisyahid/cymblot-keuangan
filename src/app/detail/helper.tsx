import convertTransactionType from '@/utils/convert-transaction-type';
import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
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

dayjs.locale('id');

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
            label="Tanggal awal"
            placeholder="Pilih tanggal awal"
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
            label="Tanggal akhir"
            placeholder="Pilih tanggal akhir"
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
      render: (record) => (
        <div style={{ whiteSpace: 'pre-line' }}>{record.information}</div>
      ),
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
      filter: () => (
        <Stack>
          <Checkbox
            checked={filter.type.includes('DEPOSIT')}
            label="PEMASUKAN"
            onChange={(e) =>
              handleChange({
                type: e.currentTarget.checked
                  ? [...filter.type, 'DEPOSIT']
                  : filter.type.filter((f) => f !== 'DEPOSIT'),
              })
            }
          />
          <Checkbox
            checked={filter.type.includes('WITHDRAW')}
            label="PENGELUARAN"
            onChange={(e) =>
              handleChange({
                type: e.currentTarget.checked
                  ? [...filter.type, 'WITHDRAW']
                  : filter.type.filter((f) => f !== 'WITHDRAW'),
              })
            }
          />
          <Checkbox
            checked={filter.type.includes('TRANSFER')}
            label="TRANSFER"
            onChange={(e) =>
              handleChange({
                type: e.currentTarget.checked
                  ? [...filter.type, 'TRANSFER']
                  : filter.type.filter((f) => f !== 'TRANSFER'),
              })
            }
          />
          {filter.type.length > 0 && (
            <Button
              color={BUTTON_BASE_COLOR}
              onClick={() => handleChange({ type: [] })}
            >
              Reset
            </Button>
          )}
        </Stack>
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
          {Object.values(filter.value).some((v) => v !== '') && (
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
          )}
        </Stack>
      ),
    },
    {
      accessor: 'category',
      title: 'Kategori',
      sortable: true,
      render: (record: any) => record.Category?.name,
      filter: () => {
        return (
          <Stack>
            {categories.map((category) => (
              <Checkbox
                key={category.id}
                checked={filter.category.includes(category.id)}
                label={category.name}
                onChange={(e) =>
                  handleChange({
                    category: e.currentTarget.checked
                      ? [...filter.category, category.id]
                      : filter.category.filter((f) => f !== category.id),
                  })
                }
              />
            ))}
            {filter.category.length > 0 && (
              <Button
                color={BUTTON_BASE_COLOR}
                onClick={() =>
                  handleChange({
                    category: [],
                  })
                }
              >
                Reset
              </Button>
            )}
          </Stack>
        );
      },
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
      filter: () => {
        return (
          <Stack>
            {pockets.map((pocket) => (
              <Checkbox
                key={pocket.id}
                checked={filter.pocket.includes(pocket.id)}
                label={pocket.name}
                onChange={(e) =>
                  handleChange({
                    pocket: e.currentTarget.checked
                      ? [...filter.pocket, pocket.id]
                      : filter.pocket.filter((f) => f !== pocket.id),
                  })
                }
              />
            ))}
            {filter.pocket.length > 0 && (
              <Button
                color={BUTTON_BASE_COLOR}
                onClick={() =>
                  handleChange({
                    pocket: [],
                  })
                }
              >
                Reset
              </Button>
            )}
          </Stack>
        );
      },
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
