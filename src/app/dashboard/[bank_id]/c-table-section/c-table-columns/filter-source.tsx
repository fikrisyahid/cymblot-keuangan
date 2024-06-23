import { Alert, Button, Checkbox, Flex } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { ITujuanSumber } from "@/types/db";
import { IFilterDetailTable } from "../../types";

export default function FilterSource({
  filter,
  handleChangeFilter,
  daftarSumber,
}: {
  filter: IFilterDetailTable;
  handleChangeFilter: (newObj: Partial<IFilterDetailTable>) => void;
  daftarSumber: ITujuanSumber[];
}) {
  return (
    <Flex direction="column" gap="sm" style={{ maxWidth: "300px" }}>
      {daftarSumber.map((item) => (
        <Checkbox
          key={item.id}
          label={item.nama}
          checked={filter.sumber.includes(item.nama)}
          disabled={filter.tujuan.length > 0}
          onChange={(e) =>
            handleChangeFilter({
              sumber: e.currentTarget.checked
                ? [...filter.sumber, item.nama]
                : filter.sumber.filter((x: string) => x !== item.nama),
            })
          }
        />
      ))}
      {filter.sumber.length > 0 && (
        <Button onClick={() => handleChangeFilter({ sumber: [] })}>
          Batalkan filter
        </Button>
      )}
      {filter.tujuan.length > 0 && (
        <Alert
          variant="filled"
          color="indigo"
          title="Info"
          icon={<IconInfoCircle />}
          p="xs"
          style={{ maxWidth: "300px" }}
        >
          Kamu tidak bisa memiliki filter sumber dan tujuan secara bersamaan.
          Silakan batalkan filter tujuan terlebih dahulu
        </Alert>
      )}
      {daftarSumber.length === 0 && (
        <Alert
          variant="filled"
          color="indigo"
          title="Info"
          icon={<IconInfoCircle />}
          p="xs"
          style={{ maxWidth: "300px" }}
        >
          Kamu belum memiliki sumber keuangan. Silakan tambahkan sumber
        </Alert>
      )}
    </Flex>
  );
}
