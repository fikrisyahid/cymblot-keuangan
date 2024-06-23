import MainCard from "@/components/main-card";
import { BUTTON_BASE_COLOR } from "@/config";
import stringToRupiah from "@/utils/string-to-rupiah";
import { Badge, Button, Flex, Input, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconRestore } from "@tabler/icons-react";
import { SetStateAction } from "react";
import { IFilterDetailTable } from "../types";

export default function DetailHeader({
  totalSaldo,
  oldestDate,
  generalSearch,
  setGeneralSearch,
  handleChangeFilter,
}: {
  totalSaldo: number;
  oldestDate: Date;
  generalSearch: string;
  setGeneralSearch: (newValue: SetStateAction<string>) => void;
  handleChangeFilter: (newObj: Partial<IFilterDetailTable>) => void;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <>
      <MainCard transparent noPadding row style={{ alignItems: "center" }}>
        <Flex direction="column" align={isMobile ? "center" : "flex-start"}>
          <Text>Total saldo:</Text>
          <Badge color={totalSaldo > 0 ? "teal" : "red"}>
            {stringToRupiah(totalSaldo.toString())}
          </Badge>
        </Flex>
        <Button
          fullWidth={isMobile}
          leftSection={<IconRestore />}
          style={{ backgroundColor: BUTTON_BASE_COLOR }}
          onClick={() =>
            handleChangeFilter({
              tanggal_sesudah: oldestDate,
              tanggal_sebelum: new Date(),
              keterangan: "",
              jenis: "SEMUA",
              sumber: [],
              tujuan: [],
              nominal_di_bawah: 0,
              nominal_di_atas: 0,
              nominal_sama_dengan: 0,
              bank: [],
            })
          }
        >
          Reset Filter
        </Button>
      </MainCard>
      <Input
        placeholder="Cari seluruh data keuangan"
        defaultValue={generalSearch}
        onChange={(e) => setGeneralSearch(e.currentTarget.value)}
      />
    </>
  );
}
