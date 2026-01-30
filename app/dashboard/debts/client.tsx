"use client";

import { useDisclosure } from "@mantine/hooks";
import {
  Title,
  Button,
  Group,
  Paper,
  Text,
  Stack,
  Badge,
  ActionIcon,
  Menu,
  SimpleGrid,
  Tabs,
} from "@mantine/core";
import {
  IconPlus,
  IconDotsVertical,
  IconTrash,
  IconCheck,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { deleteDebt, markDebtAsPaid } from "@/app/actions/debts";
import { DebtModal } from "./components/debt-modal";
import type { Debt } from "@/db/schema";
import dayjs from "dayjs";

interface DebtsClientProps {
  debts: Debt[];
}

export function DebtsClient({ debts }: DebtsClientProps) {
  const [opened, { open, close }] = useDisclosure(false);

  // LEND = piutang (kita pinjemkan ke orang), BORROW = utang (kita pinjam dari orang)
  const borrowList = debts.filter((d) => d.type === "BORROW");
  const lendList = debts.filter((d) => d.type === "LEND");

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const handleMarkPaid = async (id: string) => {
    const result = await markDebtAsPaid(id);

    if (result.success) {
      notifications.show({
        title: "Berhasil",
        message: "Ditandai sebagai lunas",
        color: "green",
        icon: <IconCheck size={18} />,
      });
    } else {
      notifications.show({
        title: "Gagal",
        message: result.error || "Gagal mengupdate",
        color: "red",
        icon: <IconX size={18} />,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus catatan ini?")) return;

    const result = await deleteDebt(id);

    if (result.success) {
      notifications.show({
        title: "Berhasil",
        message: "Catatan berhasil dihapus",
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

  const DebtCard = ({ debt }: { debt: Debt }) => {
    const isOverdue =
      debt.dueDate && new Date(debt.dueDate) < new Date() && !debt.isPaid;

    return (
      <Paper
        p="md"
        radius="md"
        withBorder
        opacity={debt.isPaid ? 0.6 : 1}
        style={{
          borderColor: isOverdue ? "var(--mantine-color-red-5)" : undefined,
        }}
      >
        <Group justify="space-between" mb="xs">
          <div>
            <Text fw={500}>{debt.personName}</Text>
            {debt.description && (
              <Text size="xs" c="dimmed">
                {debt.description}
              </Text>
            )}
          </div>

          <Menu shadow="md" width={160} position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" size="sm">
                <IconDotsVertical size={14} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              {!debt.isPaid && (
                <Menu.Item
                  leftSection={<IconCheck size={14} />}
                  onClick={() => handleMarkPaid(debt.id)}
                >
                  Tandai Lunas
                </Menu.Item>
              )}
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={() => handleDelete(debt.id)}
              >
                Hapus
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Text
          size="xl"
          fw={700}
          c={debt.type === "BORROW" ? "red" : "green"}
          mb="xs"
        >
          {formatCurrency(debt.amount)}
        </Text>

        <Group gap="xs">
          {debt.isPaid ? (
            <Badge color="green" variant="light">
              Lunas
            </Badge>
          ) : isOverdue ? (
            <Badge color="red" variant="light">
              Jatuh Tempo!
            </Badge>
          ) : debt.dueDate ? (
            <Badge color="gray" variant="light">
              Jatuh tempo: {dayjs(debt.dueDate).format("DD MMM YYYY")}
            </Badge>
          ) : null}
        </Group>
      </Paper>
    );
  };

  const totalBorrow = borrowList
    .filter((d) => !d.isPaid)
    .reduce((sum, d) => sum + parseFloat(d.amount), 0);
  const totalLend = lendList
    .filter((d) => !d.isPaid)
    .reduce((sum, d) => sum + parseFloat(d.amount), 0);

  return (
    <>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Utang & Piutang</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Tambah
        </Button>
      </Group>

      {/* Summary Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="lg">
        <Paper p="md" radius="md" withBorder>
          <Group gap="xs" mb="xs">
            <IconArrowDown size={16} color="red" />
            <Text size="sm" c="dimmed">
              Total Utang (Dipinjam)
            </Text>
          </Group>
          <Text size="xl" fw={700} c="red">
            {formatCurrency(totalBorrow)}
          </Text>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group gap="xs" mb="xs">
            <IconArrowUp size={16} color="green" />
            <Text size="sm" c="dimmed">
              Total Piutang (Dipinjamkan)
            </Text>
          </Group>
          <Text size="xl" fw={700} c="green">
            {formatCurrency(totalLend)}
          </Text>
        </Paper>
      </SimpleGrid>

      <Tabs defaultValue="borrow">
        <Tabs.List mb="md">
          <Tabs.Tab
            value="borrow"
            leftSection={<IconArrowDown size={16} />}
            rightSection={
              <Badge size="xs" variant="light">
                {borrowList.length}
              </Badge>
            }
          >
            Utang
          </Tabs.Tab>
          <Tabs.Tab
            value="lend"
            leftSection={<IconArrowUp size={16} />}
            rightSection={
              <Badge size="xs" variant="light">
                {lendList.length}
              </Badge>
            }
          >
            Piutang
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="borrow">
          {borrowList.length === 0 ? (
            <Paper p="xl" radius="md" withBorder>
              <Text c="dimmed" ta="center">
                Tidak ada catatan utang
              </Text>
            </Paper>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              {borrowList.map((debt) => (
                <DebtCard key={debt.id} debt={debt} />
              ))}
            </SimpleGrid>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="lend">
          {lendList.length === 0 ? (
            <Paper p="xl" radius="md" withBorder>
              <Text c="dimmed" ta="center">
                Tidak ada catatan piutang
              </Text>
            </Paper>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              {lendList.map((debt) => (
                <DebtCard key={debt.id} debt={debt} />
              ))}
            </SimpleGrid>
          )}
        </Tabs.Panel>
      </Tabs>

      <DebtModal opened={opened} onClose={close} />
    </>
  );
}
