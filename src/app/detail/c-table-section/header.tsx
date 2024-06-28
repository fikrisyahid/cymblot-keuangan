import MainCard from "@/components/main-card";
import { BUTTON_BASE_COLOR } from "@/config";
import stringToRupiah from "@/utils/string-to-rupiah";
import { Badge, Button, Input, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconCash, IconPlus, IconRestore } from "@tabler/icons-react";
import Link from "next/link";
import { IFilterDetailTable } from "../types";
import { SetStateAction } from "react";

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
      <MainCard
        transparent
        noPadding
        row
        style={{ alignItems: "flex-end", justifyContent: "space-between" }}
      >
        <MainCard transparent noPadding row style={{ alignItems: "flex-end" }}>
          <MainCard transparent noPadding noGap center>
            <Text>Total saldo:</Text>
            <Badge color={totalSaldo > 0 ? "teal" : "red"}>
              {stringToRupiah(totalSaldo.toString())}
            </Badge>
          </MainCard>
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
        <MainCard transparent noPadding row>
          <Button
            fullWidth={isMobile}
            leftSection={<IconPlus />}
            style={{ backgroundColor: BUTTON_BASE_COLOR }}
            component={Link}
            href="/detail/tambah"
          >
            Tambah Data Keuangan
          </Button>
          <Button
            fullWidth={isMobile}
            leftSection={<IconCash />}
            style={{ backgroundColor: BUTTON_BASE_COLOR }}
            component={Link}
            href="/detail/penarikan-penyetoran"
          >
            Penarikan & Penyetoran
          </Button>
        </MainCard>
      </MainCard>
      <Input
        placeholder="Cari seluruh data keuangan"
        defaultValue={generalSearch}
        onChange={(e) => setGeneralSearch(e.currentTarget.value)}
      />
    </>
  );
}
