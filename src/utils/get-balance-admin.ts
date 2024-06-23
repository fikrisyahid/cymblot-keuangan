import prisma from "@/app/db/init";
import { MONITORED_EMAIL } from "@/config";
import { IBanks, ITransaksi } from "@/types/db";
import { getBalanceBank } from "./get-balance";

interface IBanksWithSaldo extends IBanks {
  saldo: number;
}

function addBankWithSaldo({
  bank,
  allTransaksi,
}: {
  bank: IBanks;
  allTransaksi: ITransaksi[];
}) {
  const bankTransaksi = allTransaksi.filter(
    (transaksi) => transaksi.bankName?.id === bank.id
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
}: {
  email: string;
  daftarBank: IBanks[];
}) {
  const allTransaksi = await prisma.transaksi.findMany({
    where: {
      OR: [{ email: { in: MONITORED_EMAIL } }, { email }],
    },
  });

  const banksFromEachMonitoredEmail = await Promise.all(
    MONITORED_EMAIL.map(async (email) => {
      const banks = await prisma.banks.findMany({ where: { email } });
      const banksWithSaldo = banks.map((bank) =>
        addBankWithSaldo({ bank, allTransaksi })
      );
      return banksWithSaldo;
    })
  );

  const myBanks = daftarBank.map((bank) =>
    addBankWithSaldo({ bank, allTransaksi })
  );

  const allUserBanks = [myBanks, ...banksFromEachMonitoredEmail];
  const userBanksWithEmail = allUserBanks.map((userBanks, index) => ({
    email: index === 0 ? email : MONITORED_EMAIL[index - 1],
    banks: userBanks,
    total_saldo: calculateTotalSaldo(userBanks),
  }));

  return userBanksWithEmail;
}

export async function getBalanceBankAdmin({ email }: { email: string }) {
  const allTransaksi = await prisma.transaksi.findMany({
    where: {
      OR: [{ email: { in: MONITORED_EMAIL } }, { email }],
    },
  });

  return getBalanceBank(allTransaksi);
}
