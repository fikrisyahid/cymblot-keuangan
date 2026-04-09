"use client";

import { useState } from "react";
import {
	Card,
	Text,
	Badge,
	Group,
	ActionIcon,
	Menu,
	SimpleGrid,
} from "@mantine/core";
import {
	IconDotsVertical,
	IconEdit,
	IconTrash,
	IconEyeOff,
	IconEye,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { deleteAccount, toggleAccountStatus } from "@/app/actions/accounts";
import type { Account } from "@/db/schema";

const TYPE_LABELS: Record<string, string> = {
	CASH: "Tunai",
	BANK: "Bank",
	E_WALLET: "E-Wallet",
	CREDIT_CARD: "Kartu Kredit",
	INVESTMENT: "Investasi",
};

interface AccountCardProps {
	account: Account;
	onEdit: (account: Account) => void;
}

export function AccountCard({ account, onEdit }: AccountCardProps) {
	const [loading, setLoading] = useState(false);

	const formatCurrency = (amount: string | number) => {
		const num = typeof amount === "string" ? parseFloat(amount) : amount;
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(num);
	};

	const handleDelete = async () => {
		if (!confirm("Yakin ingin menghapus akun ini?")) return;

		setLoading(true);
		const result = await deleteAccount(account.id);

		if (result.success) {
			notifications.show({
				title: "Berhasil",
				message: "Akun berhasil dihapus",
				color: "green",
				icon: <IconCheck size={18} />,
			});
		} else {
			notifications.show({
				title: "Gagal",
				message: result.error || "Gagal menghapus akun",
				color: "red",
				icon: <IconX size={18} />,
			});
		}
		setLoading(false);
	};

	const handleToggleStatus = async () => {
		setLoading(true);
		const result = await toggleAccountStatus(account.id);

		if (result.success) {
			notifications.show({
				title: "Berhasil",
				message: account.isActive ? "Akun dinonaktifkan" : "Akun diaktifkan",
				color: "green",
				icon: <IconCheck size={18} />,
			});
		} else {
			notifications.show({
				title: "Gagal",
				message: result.error || "Gagal mengubah status",
				color: "red",
				icon: <IconX size={18} />,
			});
		}
		setLoading(false);
	};

	return (
		<Card
			shadow="sm"
			padding="lg"
			radius="md"
			withBorder
			opacity={account.isActive ? 1 : 0.6}
		>
			<Group justify="space-between" mb="xs">
				<Group gap="xs">
					<Text size="xl">{account.icon || "💰"}</Text>
					<div>
						<Text fw={500}>{account.name}</Text>
						<Badge size="xs" variant="light">
							{TYPE_LABELS[account.type] || account.type}
						</Badge>
					</div>
				</Group>

				<Menu shadow="md" width={160} position="bottom-end">
					<Menu.Target>
						<ActionIcon variant="subtle" loading={loading}>
							<IconDotsVertical size={16} />
						</ActionIcon>
					</Menu.Target>

					<Menu.Dropdown>
						<Menu.Item
							leftSection={<IconEdit size={14} />}
							onClick={() => onEdit(account)}
						>
							Edit
						</Menu.Item>
						<Menu.Item
							leftSection={
								account.isActive ? (
									<IconEyeOff size={14} />
								) : (
									<IconEye size={14} />
								)
							}
							onClick={handleToggleStatus}
						>
							{account.isActive ? "Nonaktifkan" : "Aktifkan"}
						</Menu.Item>
						<Menu.Divider />
						<Menu.Item
							leftSection={<IconTrash size={14} />}
							color="red"
							onClick={handleDelete}
						>
							Hapus
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Group>

			<Text
				size="xl"
				fw={700}
				mt="md"
				style={{ color: account.color || undefined }}
			>
				{formatCurrency(account.balance)}
			</Text>

			{!account.isActive && (
				<Badge color="gray" size="xs" mt="xs">
					Nonaktif
				</Badge>
			)}
		</Card>
	);
}

interface AccountListProps {
	accounts: Account[];
	onEdit: (account: Account) => void;
}

export function AccountList({ accounts, onEdit }: AccountListProps) {
	if (accounts.length === 0) {
		return null;
	}

	return (
		<SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="md">
			{accounts.map((account) => (
				<AccountCard key={account.id} account={account} onEdit={onEdit} />
			))}
		</SimpleGrid>
	);
}
