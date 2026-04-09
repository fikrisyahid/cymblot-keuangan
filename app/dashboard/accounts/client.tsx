"use client";

import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { Title, Button, Group, Paper, Text, Stack } from "@mantine/core";
import { IconPlus, IconWallet } from "@tabler/icons-react";
import { AccountModal } from "./components/account-modal";
import { AccountList } from "./components/account-list";
import type { Account } from "@/db/schema";

interface AccountsClientProps {
	accounts: Account[];
}

export function AccountsClient({ accounts }: AccountsClientProps) {
	const [opened, { open, close }] = useDisclosure(false);
	const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

	const handleEdit = (account: Account) => {
		setSelectedAccount(account);
		open();
	};

	const handleClose = () => {
		setSelectedAccount(null);
		close();
	};

	const handleAdd = () => {
		setSelectedAccount(null);
		open();
	};

	// Calculate total balance
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
			<Group justify="space-between" mb="lg">
				<Title order={2}>Akun Keuangan</Title>
				<Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
					Tambah Akun
				</Button>
			</Group>

			{/* Total Balance Card */}
			<Paper p="md" radius="md" withBorder mb="lg">
				<Group justify="space-between">
					<div>
						<Text size="sm" c="dimmed">
							Total Saldo (Aktif)
						</Text>
						<Text size="xl" fw={700}>
							{formatCurrency(totalBalance)}
						</Text>
					</div>
					<Text size="sm" c="dimmed">
						{accounts.filter((a) => a.isActive).length} akun aktif
					</Text>
				</Group>
			</Paper>

			{accounts.length === 0 ? (
				<Paper p="xl" radius="md" withBorder>
					<Stack align="center" gap="md">
						<IconWallet size={48} stroke={1} color="gray" />
						<Text c="dimmed" ta="center">
							Belum ada akun. Tambahkan akun pertamamu!
						</Text>
						<Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
							Tambah Akun
						</Button>
					</Stack>
				</Paper>
			) : (
				<AccountList accounts={accounts} onEdit={handleEdit} />
			)}

			<AccountModal
				opened={opened}
				onClose={handleClose}
				account={selectedAccount}
			/>
		</>
	);
}
