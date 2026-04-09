"use client";

import { useState } from "react";
import {
	Title,
	Text,
	Paper,
	Stack,
	Group,
	PasswordInput,
	TextInput,
	Button,
	SimpleGrid,
	ThemeIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX, IconLock, IconUser } from "@tabler/icons-react";
import { changePassword, changeName } from "@/app/actions/auth";

export default function SettingsPage() {
	const [loading, setLoading] = useState(false);
	const [nameLoading, setNameLoading] = useState(false);

	const nameForm = useForm({
		initialValues: {
			newName: "",
		},
		validate: {
			newName: (value) =>
				value.trim().length >= 1 ? null : "Nama tidak boleh kosong",
		},
	});

	const handleChangeName = async (values: typeof nameForm.values) => {
		setNameLoading(true);

		const formData = new FormData();
		formData.append("newName", values.newName.trim());

		const result = await changeName(formData);

		if (result.success) {
			notifications.show({
				title: "Berhasil",
				message: "Nama berhasil diubah",
				color: "green",
				icon: <IconCheck size={16} />,
			});
			nameForm.reset();
		} else {
			notifications.show({
				title: "Gagal",
				message: result.error || "Gagal mengubah nama",
				color: "red",
				icon: <IconX size={16} />,
			});
		}

		setNameLoading(false);
	};

	const form = useForm({
		initialValues: {
			currentPassword: "",
			newPassword: "",
			confirmNewPassword: "",
		},
		validate: {
			currentPassword: (value) =>
				value.length >= 1 ? null : "Password lama harus diisi",
			newPassword: (value) =>
				value.length >= 6 ? null : "Password baru minimal 6 karakter",
			confirmNewPassword: (value, values) =>
				value === values.newPassword ? null : "Password baru tidak cocok",
		},
	});

	const handleChangePassword = async (values: typeof form.values) => {
		setLoading(true);

		const formData = new FormData();
		formData.append("currentPassword", values.currentPassword);
		formData.append("newPassword", values.newPassword);
		formData.append("confirmNewPassword", values.confirmNewPassword);

		const result = await changePassword(formData);

		if (result.success) {
			notifications.show({
				title: "Berhasil",
				message: "Password berhasil diubah",
				color: "green",
				icon: <IconCheck size={16} />,
			});
			form.reset();
		} else {
			notifications.show({
				title: "Gagal",
				message: result.error || "Gagal mengubah password",
				color: "red",
				icon: <IconX size={16} />,
			});
		}

		setLoading(false);
	};

	return (
		<>
			<Title order={2} mb="lg">
				Pengaturan
			</Title>
			<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
				{/* Change Name Section */}
				<Paper p="lg" radius="md" withBorder>
					<Group gap="sm" mb="lg">
						<ThemeIcon variant="light" radius="md" size="lg">
							<IconUser size={18} />
						</ThemeIcon>
						<div>
							<Text fw={600}>Ubah Nama</Text>
							<Text size="xs" c="dimmed">
								Perbarui nama tampilan akun kamu
							</Text>
						</div>
					</Group>
					<form onSubmit={nameForm.onSubmit(handleChangeName)}>
						<Stack gap="sm">
							<TextInput
								label="Nama Baru"
								placeholder="Masukkan nama baru"
								{...nameForm.getInputProps("newName")}
							/>
							<Group justify="flex-end" mt="xs">
								<Button type="submit" loading={nameLoading}>
									Simpan Nama
								</Button>
							</Group>
						</Stack>
					</form>
				</Paper>

				{/* Change Password Section */}
				<Paper p="lg" radius="md" withBorder>
					<Group gap="sm" mb="lg">
						<ThemeIcon variant="light" radius="md" size="lg" color="orange">
							<IconLock size={18} />
						</ThemeIcon>
						<div>
							<Text fw={600}>Ubah Password</Text>
							<Text size="xs" c="dimmed">
								Ganti password untuk keamanan akun
							</Text>
						</div>
					</Group>
					<form onSubmit={form.onSubmit(handleChangePassword)}>
						<Stack gap="sm">
							<PasswordInput
								label="Password Lama"
								placeholder="Masukkan password lama"
								{...form.getInputProps("currentPassword")}
							/>
							<PasswordInput
								label="Password Baru"
								placeholder="Masukkan password baru"
								{...form.getInputProps("newPassword")}
							/>
							<PasswordInput
								label="Konfirmasi Password Baru"
								placeholder="Masukkan ulang password baru"
								{...form.getInputProps("confirmNewPassword")}
							/>
							<Group justify="flex-end" mt="xs">
								<Button type="submit" loading={loading} color="orange">
									Ubah Password
								</Button>
							</Group>
						</Stack>
					</form>
				</Paper>
			</SimpleGrid>
		</>
	);
}
