import { ActionIcon, TextInput } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { IFilterDetailTable } from "../../types";

export default function FilterInformation({
  filter,
  handleChangeFilter,
}: {
  filter: IFilterDetailTable;
  handleChangeFilter: (newObj: Partial<IFilterDetailTable>) => void;
}) {
  return (
    <TextInput
      label="Keterangan"
      description="Filter data keuangan berdasarkan keterangan"
      placeholder="Masukkan keterangan"
      leftSection={<IconSearch size={16} />}
      rightSection={
        <ActionIcon
          size="sm"
          variant="transparent"
          c="dimmed"
          onClick={() => handleChangeFilter({ keterangan: "" })}
        >
          <IconX size={14} />
        </ActionIcon>
      }
      value={filter.keterangan}
      onChange={(e) =>
        handleChangeFilter({ keterangan: e.currentTarget.value })
      }
    />
  );
}
