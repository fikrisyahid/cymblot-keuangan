import MainCard from "./main-card";
import { Badge, Stack, Text } from "@mantine/core";
import stringToRupiah from "@/utils/string-to-rupiah";
import { TEXT_COLOR } from "@/config";

export default function ListBankBalance({
  totalBalanceBankDetail,
}: {
  totalBalanceBankDetail: any;
}) {
  return (
    <Stack>
      <Text fw={700} c={TEXT_COLOR}>
        Detail saldo bank
      </Text>
      <MainCard transparent noPadding row wrap>
        {Object.keys(totalBalanceBankDetail).map((bankName) => (
          <MainCard key={bankName} row style={{ alignItems: "center" }}>
            <Text>Saldo {bankName}</Text>
            <Badge
              color={totalBalanceBankDetail[bankName] > 0 ? "teal" : "red"}
            >
              {stringToRupiah(totalBalanceBankDetail[bankName].toString())}
            </Badge>
          </MainCard>
        ))}
      </MainCard>
    </Stack>
  );
}
