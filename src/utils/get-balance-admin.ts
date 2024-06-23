import prisma from "@/app/db/init";
import { MONITORED_EMAIL } from "@/config";
import { IBanks, ITransaksi } from "@/types/db";
import { getBalanceBank } from "./get-balance";

interface IBanksWithSaldo extends IBanks {
  saldo: number;
}

function addBankWithSaldo({
  bank,
  transaksiUser,
}: {
  bank: IBanks;
  transaksiUser: ITransaksi[];
}) {
  const bankTransaksi = transaksiUser.filter(
    (transaksi) => transaksi.bankNameId === bank.id
  );
  const saldo = getBalanceBank(bankTransaksi);
  return { ...bank, saldo };
}

function calculateTotalSaldo(banks: IBanksWithSaldo[]) {
  return banks.reduce((acc, bank) => acc + bank.saldo, 0);
}

export async function getBalanceBankDetailAdmin({
  email,
  daftarBank,
  transaksiUser,
}: {
  email: string;
  daftarBank: IBanks[];
  transaksiUser: ITransaksi[];
}) {
  const banksFromEachMonitoredEmail = await Promise.all(
    MONITORED_EMAIL.map(async (email) => {
      const banks = await prisma.banks.findMany({ where: { email } });
      const banksWithSaldo = banks.map((bank) =>
        addBankWithSaldo({ bank, transaksiUser })
      );
      return banksWithSaldo;
    })
  );

  const myBanks = daftarBank.map((bank) =>
    addBankWithSaldo({ bank, transaksiUser })
  );

  const allUserBanks = [myBanks, ...banksFromEachMonitoredEmail];
  const userBanksWithEmail = allUserBanks.map((userBanks, index) => ({
    email: index === 0 ? email : MONITORED_EMAIL[index - 1],
    banks: userBanks,
    total_saldo: calculateTotalSaldo(userBanks),
  }));

  return userBanksWithEmail;
}
