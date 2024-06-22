import MainCard from "./main-card";
import { Badge, Stack, Text } from "@mantine/core";
import stringToRupiah from "@/utils/string-to-rupiah";
import { TEXT_COLOR } from "@/config";

export default function ListBankBalance({
  totalSaldoBankDetail,
}: {
  totalSaldoBankDetail: any;
}) {
  return (
    <Stack>
      <Text fw={700} c={TEXT_COLOR}>
        Detail saldo bank
      </Text>
      <MainCard transparent noPadding row wrap>
        {Object.keys(totalSaldoBankDetail).map((bankName) => (
          <MainCard key={bankName} row style={{ alignItems: "center" }}>
            <Text>Saldo {bankName}</Text>
            <Badge
              color={totalSaldoBankDetail[bankName] > 0 ? "teal" : "red"}
            >
              {stringToRupiah(totalSaldoBankDetail[bankName].toString())}
            </Badge>
          </MainCard>
        ))}
      </MainCard>
    </Stack>
  );
}
