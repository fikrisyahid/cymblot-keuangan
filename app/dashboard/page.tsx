import { getSession } from "@/lib/auth";
import { getAccounts } from "@/app/actions/accounts";
import { getRecentTransactions, getMonthlySummary } from "@/app/actions/transactions";
import { Title, Text, Paper, SimpleGrid, Group, ThemeIcon, Table, Badge, Stack } from "@mantine/core";
import {
  IconWallet,
  IconArrowUp,
  IconArrowDown,
  IconScale,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

export default async function DashboardPage() {
  const session = await getSession();
  const now = new Date();

  const [accounts, recentTransactions, monthlySummary] = await Promise.all([
    getAccounts(),
    getRecentTransactions(5),
    getMonthlySummary(now.getFullYear(), now.getMonth() + 1),
  ]);

  // Calculate totals
  const totalBalance = accounts
    .filter((a) => a.isActive)
    .reduce((sum, a) => sum + parseFloat(a.balance), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <Title order={2} mb="lg">
        Selamat datang, {session?.email?.split("@")[0]}! 👋
      </Title>

      {/* Quick Stats */}
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md" mb="xl">
        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Total Saldo
              </Text>
              <Text size="xl" fw={700}>
                {formatCurrency(totalBalance)}
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="blue">
              <IconWallet size={20} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Pemasukan Bulan Ini
              </Text>
              <Text size="xl" fw={700} c="green">
                {formatCurrency(monthlySummary.income)}
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="green">
              <IconArrowUp size={20} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Pengeluaran Bulan Ini
              </Text>
              <Text size="xl" fw={700} c="red">
                {formatCurrency(monthlySummary.expense)}
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="red">
              <IconArrowDown size={20} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Selisih
              </Text>
              <Text size="xl" fw={700} c={monthlySummary.income - monthlySummary.expense >= 0 ? "green" : "red"}>
                {formatCurrency(monthlySummary.income - monthlySummary.expense)}
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="orange">
              <IconScale size={20} />
            </ThemeIcon>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Recent Transactions */}
      <Paper p="md" radius="md" withBorder>
        <Title order={4} mb="md">
          Transaksi Terakhir
        </Title>

        {recentTransactions.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            Belum ada transaksi
          </Text>
        ) : (
          <Table.ScrollContainer minWidth={400}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Transaksi</Table.Th>
                  <Table.Th>Akun</Table.Th>
                  <Table.Th ta="right">Nominal</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {recentTransactions.map((txn) => (
                  <Table.Tr key={txn.id}>
                    <Table.Td>
                      <Stack gap={0}>
                        <Text size="sm" fw={500}>{txn.description}</Text>
                        <Text size="xs" c="dimmed">
                          {dayjs(txn.date).format("DD MMM YYYY")}
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" size="sm">
                        {txn.account?.icon} {txn.account?.name}
                      </Badge>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text fw={600} c={txn.type === "INCOME" ? "green" : "red"} size="sm">
                        {txn.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(parseFloat(txn.amount))}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Paper>
    </>
  );
}
