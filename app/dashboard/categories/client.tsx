"use client";

import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
	Title,
	Button,
	Group,
	Paper,
	Text,
	Tabs,
	Badge,
	ActionIcon,
	Menu,
	SimpleGrid,
	Box,
} from "@mantine/core";
import {
	IconPlus,
	IconArrowUp,
	IconArrowDown,
	IconDotsVertical,
	IconEdit,
	IconTrash,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { CategoryModal } from "./components/category-modal";
import { deleteCategory } from "@/app/actions/categories";
import type { Category } from "@/db/schema";

interface CategoriesClientProps {
	categories: Category[];
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
	const [opened, { open, close }] = useDisclosure(false);
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(
		null,
	);

	const incomeCategories = categories.filter((c) => c.type === "INCOME");
	const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

	const handleEdit = (category: Category) => {
		setSelectedCategory(category);
		open();
	};

	const handleClose = () => {
		setSelectedCategory(null);
		close();
	};

	const handleAdd = () => {
		setSelectedCategory(null);
		open();
	};

	const handleDelete = async (category: Category) => {
		if (category.isDefault) {
			notifications.show({
				title: "Tidak bisa dihapus",
				message: "Kategori default tidak bisa dihapus",
				color: "orange",
			});
			return;
		}

		if (!confirm("Yakin ingin menghapus kategori ini?")) return;

		const result = await deleteCategory(category.id);

		if (result.success) {
			notifications.show({
				title: "Berhasil",
				message: "Kategori berhasil dihapus",
				color: "green",
				icon: <IconCheck size={18} />,
			});
		} else {
			notifications.show({
				title: "Gagal",
				message: result.error || "Gagal menghapus kategori",
				color: "red",
				icon: <IconX size={18} />,
			});
		}
	};

	const CategoryCard = ({ category }: { category: Category }) => (
		<Paper p="sm" radius="md" withBorder>
			<Group justify="space-between">
				<Group gap="sm">
					<Box
						style={{
							width: 40,
							height: 40,
							borderRadius: "var(--mantine-radius-md)",
							backgroundColor: category.color || "#e9ecef",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 20,
						}}
					>
						{category.icon || "📁"}
					</Box>
					<div>
						<Text fw={500} size="sm">
							{category.name}
						</Text>
						{category.isDefault && (
							<Badge size="xs" variant="light" color="gray">
								Default
							</Badge>
						)}
					</div>
				</Group>

				<Menu shadow="md" width={140} position="bottom-end">
					<Menu.Target>
						<ActionIcon variant="subtle" size="sm">
							<IconDotsVertical size={14} />
						</ActionIcon>
					</Menu.Target>

					<Menu.Dropdown>
						<Menu.Item
							leftSection={<IconEdit size={14} />}
							onClick={() => handleEdit(category)}
						>
							Edit
						</Menu.Item>
						{!category.isDefault && (
							<>
								<Menu.Divider />
								<Menu.Item
									leftSection={<IconTrash size={14} />}
									color="red"
									onClick={() => handleDelete(category)}
								>
									Hapus
								</Menu.Item>
							</>
						)}
					</Menu.Dropdown>
				</Menu>
			</Group>
		</Paper>
	);

	return (
		<>
			<Group justify="space-between" mb="lg">
				<Title order={2}>Kategori</Title>
				<Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
					Tambah Kategori
				</Button>
			</Group>

			<Tabs defaultValue="expense">
				<Tabs.List mb="md">
					<Tabs.Tab
						value="expense"
						leftSection={<IconArrowDown size={16} />}
						rightSection={
							<Badge size="xs" variant="light">
								{expenseCategories.length}
							</Badge>
						}
					>
						Pengeluaran
					</Tabs.Tab>
					<Tabs.Tab
						value="income"
						leftSection={<IconArrowUp size={16} />}
						rightSection={
							<Badge size="xs" variant="light">
								{incomeCategories.length}
							</Badge>
						}
					>
						Pemasukan
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="expense">
					{expenseCategories.length === 0 ? (
						<Paper p="xl" radius="md" withBorder>
							<Text c="dimmed" ta="center">
								Belum ada kategori pengeluaran
							</Text>
						</Paper>
					) : (
						<SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="sm">
							{expenseCategories.map((cat) => (
								<CategoryCard key={cat.id} category={cat} />
							))}
						</SimpleGrid>
					)}
				</Tabs.Panel>

				<Tabs.Panel value="income">
					{incomeCategories.length === 0 ? (
						<Paper p="xl" radius="md" withBorder>
							<Text c="dimmed" ta="center">
								Belum ada kategori pemasukan
							</Text>
						</Paper>
					) : (
						<SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="sm">
							{incomeCategories.map((cat) => (
								<CategoryCard key={cat.id} category={cat} />
							))}
						</SimpleGrid>
					)}
				</Tabs.Panel>
			</Tabs>

			<CategoryModal
				opened={opened}
				onClose={handleClose}
				category={selectedCategory}
			/>
		</>
	);
}
