import MainCard from "./main-card";
import { ActionIcon, Badge, Text } from "@mantine/core";
import stringToRupiah from "@/utils/string-to-rupiah";
import { TEXT_COLOR } from "@/config";
import { IconEye } from "@tabler/icons-react";
import { ITotalSaldoBankDetail } from "@/app/dashboard/types";
import Link from "next/link";

export default function ListBankBalanceAdmin({
  totalSaldoBankDetail,
}: {
  totalSaldoBankDetail: ITotalSaldoBankDetail[];
}) {
  return (
    <MainCard transparent noPadding gap={16}>
      {totalSaldoBankDetail.map(
        (item: ITotalSaldoBankDetail, index: number) => (
          <MainCard key={item?.email} transparent noPadding>
            <Text fw={700} c={TEXT_COLOR}>
              {index === 0 ? "Pribadi" : item?.email || "Email tidak diketahui"}
            </Text>
            <MainCard
              transparent
              noPadding
              row
              wrap
              style={{ alignItems: "center" }}
            >
              <MainCard row style={{ alignItems: "center" }}>
                <Text>Saldo Total</Text>
                <Badge color={item?.total_saldo > 0 ? "violet" : "red"}>
                  {stringToRupiah(item?.total_saldo?.toString())}
                </Badge>
              </MainCard>
              {item?.banks?.map((bank: any) => (
                <MainCard key={bank.id} row style={{ alignItems: "center" }}>
                  <Text>Saldo {bank?.nama}</Text>
                  <Badge color={bank?.saldo > 0 ? "teal" : "red"}>
                    {stringToRupiah(bank?.saldo?.toString())}
                  </Badge>
                  <ActionIcon
                    variant="subtle"
                    c={TEXT_COLOR}
                    component={Link}
                    href={`/dashboard/${bank.id}`}
                  >
                    <IconEye />
                  </ActionIcon>
                </MainCard>
              ))}
              {item?.banks?.length === 0 && (
                <Text>Pengguna belum memiliki bank</Text>
              )}
            </MainCard>
          </MainCard>
        )
      )}
    </MainCard>
  );
}
