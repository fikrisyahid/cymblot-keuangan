"use client";

import { ActionIcon } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { useRouter } from "next-nprogress-bar";

export default function EditDataKeuanganButton({ id }: { id: string }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/detail/${id}`);
  };

  return (
    <ActionIcon
      variant="filled"
      aria-label="Delete"
      onClick={handleClick}
      color="yellow"
    >
      <IconEdit />
    </ActionIcon>
  );
}
