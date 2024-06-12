import { ActionIcon, Flex, Text, TextInput } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { IFilterGraph } from "../types";

export default function FilterInformation({
  filter,
  handleChangeFilter,
}: {
  filter: IFilterGraph;
  handleChangeFilter: (newObj: Partial<IFilterGraph>) => void;
}) {
  return (
    <Flex direction="column" gap="sm">
      <Text fw={700}>Keterangan</Text>
      <TextInput
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
    </Flex>
  );
}
