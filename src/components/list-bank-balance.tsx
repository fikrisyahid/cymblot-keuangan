import MainCard from "./main-card";
import { Badge, Stack, Text } from "@mantine/core";
import stringToRupiah from "@/utils/string-to-rupiah";

export default function ListBankBalance({
  totalBalanceBankDetail,
}: {
  totalBalanceBankDetail: any;
}) {
  return (
    <MainCard transparent noPadding>
      {Object.keys(totalBalanceBankDetail).map((bankName) => (
        <Stack key={bankName} gap={0}>
          <Text>Saldo Bank {bankName}</Text>
          <Badge color={totalBalanceBankDetail[bankName] > 0 ? "teal" : "red"}>
            {stringToRupiah(totalBalanceBankDetail[bankName].toString())}
          </Badge>
        </Stack>
      ))}
    </MainCard>
  );
}
