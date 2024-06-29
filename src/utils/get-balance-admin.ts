import { IBanks, ITransaksi } from "@/types/db";
import { getBalanceBank } from "./get-balance";
import { MONITORED_EMAIL } from "@/config";

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

function groupByEmail(userBanks: IBanksWithSaldo[]) {
  const grouped = userBanks.reduce((acc, currentUserBank) => {
    if (!acc[currentUserBank.email]) {
      acc[currentUserBank.email] = {
        email: currentUserBank.email,
        banks: [],
        total_saldo: 0,
      };
    }
    acc[currentUserBank.email].banks.push(currentUserBank);
    acc[currentUserBank.email].total_saldo = calculateTotalSaldo(userBanks);
    return acc;
  }, {} as { [key: string]: { email: string; banks: IBanksWithSaldo[]; total_saldo: number } });

  return Object.values(grouped);
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
  const monitoredEmailWithBanks: string[] = [];
  daftarBank.forEach((bank) => {
    if (!monitoredEmailWithBanks.includes(bank.email)) {
      monitoredEmailWithBanks.push(bank.email);
    }
  });
  const monitoredEmailWithoutBanks: string[] = MONITORED_EMAIL.filter(
    (email) => !monitoredEmailWithBanks.includes(email)
  );
  const userBanksWithSaldo = daftarBank.map((bank) =>
    addBankWithSaldo({ bank, transaksiUser })
  );
  const userBanksWithEmail = groupByEmail(userBanksWithSaldo);
  monitoredEmailWithoutBanks.forEach((email) => {
    userBanksWithEmail.push({
      email,
      banks: [],
      total_saldo: 0,
    });
  });
  userBanksWithEmail.sort((a, b) => {
    if (a.email === email) return -1;
    if (b.email === email) return 1;
    return 0;
  });
  return userBanksWithEmail;
}
