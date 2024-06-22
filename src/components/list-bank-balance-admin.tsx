import MainCard from "./main-card";
import { Badge, Stack, Text } from "@mantine/core";
import stringToRupiah from "@/utils/string-to-rupiah";
import PrettyJSON from "./pretty-json";

export default async function ListBankBalanceAdmin({
  detailBankData,
}: {
  detailBankData: any;
}) {
  return (
    <MainCard transparent noPadding>
      <MainCard transparent noPadding row>
        {detailBankData.map((item: any, index: number) => (
          <MainCard key={item?.email} fullWidth>
            <Text fw={700}>
              {index === 0 ? "Pribadi" : item?.email || "Email tidak diketahui"}
            </Text>
            <Stack>
              {item?.banks?.map((bank: any) => (
                <Stack key={bank.id} gap={0}>
                  <Text>Saldo {bank?.nama}</Text>
                  <Badge color={bank?.saldo > 0 ? "teal" : "red"}>
                    {stringToRupiah(bank?.saldo?.toString())}
                  </Badge>
                </Stack>
              ))}
              {item?.banks?.length === 0 && (
                <Text>Pengguna belum memiliki bank</Text>
              )}
            </Stack>
          </MainCard>
        ))}
      </MainCard>
      <PrettyJSON text={detailBankData} />
    </MainCard>
  );
}
