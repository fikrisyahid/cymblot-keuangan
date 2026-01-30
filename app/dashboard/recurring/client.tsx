"use client";

import { useDisclosure } from "@mantine/hooks";
import {
  Title,
  Button,
  Group,
  Paper,
  Text,
  Stack,
  Table,
  Badge,
  ActionIcon,
  Menu,
  Switch,
} from "@mantine/core";
import {
  IconPlus,
  IconReceipt,
  IconDotsVertical,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import {
  deleteRecurring,
  toggleRecurringStatus,
} from "@/app/actions/recurring";
import { RecurringModal } from "./components/recurring-modal";
import type { Account, Category, RecurringTransaction } from "@/db/schema";
import dayjs from "dayjs";

type RecurringWithRelations = RecurringTransaction & {
  account: Account;
  category: Category | null;
};

const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: "Harian",
  WEEKLY: "Mingguan",
  MONTHLY: "Bulanan",
  YEARLY: "Tahunan",
};

interface RecurringClientProps {
  recurringTransactions: RecurringWithRelations[];
  accounts: Account[];
  categories: Category[];
}

export function RecurringClient({
  recurringTransactions,
  accounts,
  categories,
}: RecurringClientProps) {
  const [opened, { open, close }] = useDisclosure(false);

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const handleToggle = async (id: string) => {
    const result = await toggleRecurringStatus(id);

    if (!result.success) {
      notifications.show({
        title: "Gagal",
        message: result.error || "Gagal mengubah status",
        color: "red",
        icon: <IconX size={18} />,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus transaksi berulang ini?")) return;

    const result = await deleteRecurring(id);

    if (result.success) {
      notifications.show({
        title: "Berhasil",
        message: "Transaksi berulang berhasil dihapus",
        color: "green",
        icon: <IconCheck size={18} />,
      });
    } else {
      notifications.show({
        title: "Gagal",
        message: result.error || "Gagal menghapus",
        color: "red",
        icon: <IconX size={18} />,
      });
    }
  };

  const rows = recurringTransactions.map((item) => (
    <Table.Tr key={item.id} opacity={item.isActive ? 1 : 0.5}>
      <Table.Td>
        <Group gap="xs">
          {item.type === "INCOME" ? (
            <IconArrowUp size={16} color="green" />
          ) : (
            <IconArrowDown size={16} color="red" />
          )}
          <div>
            <Text size="sm" fw={500}>
              {item.description}
            </Text>
            <Text size="xs" c="dimmed">
              {item.account?.icon} {item.account?.name}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" size="sm">
          {FREQUENCY_LABELS[item.frequency]}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">
          {dayjs(item.nextDueDate).format("DD MMM YYYY")}
        </Text>
      </Table.Td>
      <Table.Td ta="right">
        <Text fw={600} c={item.type === "INCOME" ? "green" : "red"} size="sm">
          {item.type === "INCOME" ? "+" : "-"}
          {formatCurrency(item.amount)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Switch
          checked={item.isActive}
          onChange={() => handleToggle(item.id)}
          size="sm"
        />
      </Table.Td>
      <Table.Td>
        <Menu shadow="md" width={140} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" size="sm">
              <IconDotsVertical size={14} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconTrash size={14} />}
              color="red"
              onClick={() => handleDelete(item.id)}
            >
              Hapus
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Transaksi Berulang</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Tambah Transaksi
        </Button>
      </Group>

      {recurringTransactions.length === 0 ? (
        <Paper p="xl" radius="md" withBorder>
          <Stack align="center" gap="md">
            <IconReceipt size={48} stroke={1} color="gray" />
            <Text c="dimmed" ta="center">
              Belum ada transaksi berulang. Tambahkan tagihan rutin atau
              pemasukan tetap!
            </Text>
            <Button leftSection={<IconPlus size={16} />} onClick={open}>
              Tambah Transaksi
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Paper radius="md" withBorder>
          <Table.ScrollContainer minWidth={600}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Transaksi</Table.Th>
                  <Table.Th>Frekuensi</Table.Th>
                  <Table.Th>Tanggal Berikutnya</Table.Th>
                  <Table.Th ta="right">Nominal</Table.Th>
                  <Table.Th>Aktif</Table.Th>
                  <Table.Th w={50}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      )}

      <RecurringModal
        opened={opened}
        onClose={close}
        accounts={accounts}
        categories={categories}
      />
    </>
  );
}
