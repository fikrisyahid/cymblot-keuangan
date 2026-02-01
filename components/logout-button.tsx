"use client";

import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    notifications.show({
      title: "Berhasil",
      message: "Kamu telah logout",
      color: "green",
      icon: <IconCheck size={18} />,
    });

    // Small delay so notification shows before redirect
    setTimeout(async () => {
      await logout();
      router.push("/login");
      router.refresh();
    }, 500);
  };

  return (
    <Button onClick={handleLogout} variant="light" color="red">
      Logout
    </Button>
  );
}
