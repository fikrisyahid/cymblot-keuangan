import { Alert, Button, Checkbox, Flex, Text } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { ITujuanSumber } from "@/types/db";
import { IFilterGraph } from "../types";

export default function FilterPurpose({
  filter,
  handleChangeFilter,
  daftarTujuan,
}: {
  filter: IFilterGraph;
  handleChangeFilter: (newObj: Partial<IFilterGraph>) => void;
  daftarTujuan: ITujuanSumber[];
}) {
  return (
    <Flex direction="column" gap="sm">
      <Text fw={700}>Daftar Tujuan</Text>
      {daftarTujuan.map((item) => (
        <Checkbox
          key={item.id}
          label={item.nama}
          checked={filter.tujuan.includes(item.nama)}
          disabled={filter.sumber.length > 0}
          onChange={(e) =>
            handleChangeFilter({
              tujuan: e.currentTarget.checked
                ? [...filter.tujuan, item.nama]
                : filter.tujuan.filter((x: string) => x !== item.nama),
            })
          }
        />
      ))}
      {filter.tujuan.length > 0 && (
        <Button onClick={() => handleChangeFilter({ tujuan: [] })}>
          Batalkan filter
        </Button>
      )}
      {filter.sumber.length > 0 && (
        <Alert
          variant="filled"
          color="indigo"
          title="Info"
          icon={<IconInfoCircle />}
          p="xs"
          style={{ maxWidth: "300px" }}
        >
          Kamu tidak bisa memiliki filter tujuan dan sumber secara bersamaan.
          Silakan batalkan filter sumber terlebih dahulu
        </Alert>
      )}
      {daftarTujuan.length === 0 && (
        <Alert
          variant="filled"
          color="indigo"
          title="Info"
          icon={<IconInfoCircle />}
          p="xs"
          style={{ maxWidth: "300px" }}
        >
          Kamu belum memiliki tujuan keuangan. Silakan tambahkan tujuan
        </Alert>
      )}
    </Flex>
  );
}
