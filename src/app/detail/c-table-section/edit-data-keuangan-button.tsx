import { ActionIcon } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import Link from "next/link";

export default function EditDataKeuanganButton({ id }: { id: string }) {
  return (
    <ActionIcon
      variant="filled"
      aria-label="Delete"
      color="yellow"
      component={Link}
      href={`/detail/${id}`}
    >
      <IconEdit />
    </ActionIcon>
  );
}
