import { IBanks } from "@/types/db";
import MainCard from "./main-card";
import { Badge, Stack, Text } from "@mantine/core";
import stringToRupiah from "@/utils/string-to-rupiah";

export default function ListBankBalance({
  totalSaldoBankDetail,
  daftarBank,
}: {
  totalSaldoBankDetail: any;
  daftarBank: IBanks[];
}) {
  return (
    <MainCard transparent noPadding>
      {daftarBank.map((item) => (
        <Stack key={item.id} gap={0}>
          <Text>Saldo Bank {item.nama}</Text>
          <Badge color={totalSaldoBankDetail[item.nama] > 0 ? "teal" : "red"}>
            {stringToRupiah(totalSaldoBankDetail[item.nama].toString())}
          </Badge>
        </Stack>
      ))}
    </MainCard>
  );
}
