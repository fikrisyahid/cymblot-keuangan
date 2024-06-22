import prisma from "@/app/db/init";
import { MONITORED_EMAIL } from "@/config";
import { IBanks, ITransaksi } from "@/types/db";

function calculateSaldo({ transaksiUser }: { transaksiUser: ITransaksi[] }) {
  const balanceBank = {
    add: transaksiUser
      .filter(
        (transaksi) =>
          transaksi.bank &&
          (transaksi.jenis === "PEMASUKAN" || transaksi.jenis === "PENYETORAN")
      )
      .reduce((acc, cur) => acc + cur.nominal, 0),
    subtract: transaksiUser
      .filter(
        (transaksi) =>
          transaksi.bank &&
          (transaksi.jenis === "PENGELUARAN" || transaksi.jenis === "PENARIKAN")
      )
      .reduce((acc, cur) => acc + cur.nominal, 0),
  };

  return balanceBank.add - balanceBank.subtract;
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
  const saldo = calculateSaldo({ transaksiUser: bankTransaksi });
  return { ...bank, saldo };
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
    include: {
      sumber: true,
      tujuan: true,
      bankName: true,
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

  const myBanks = await Promise.all(
    daftarBank.map((bank) => addBankWithSaldo({ bank, allTransaksi }))
  );

  const allUserBanks = [myBanks, ...banksFromEachMonitoredEmail];
  const userBanksWithEmail = allUserBanks.map((userBanks, index) => ({
    email: index === 0 ? email : MONITORED_EMAIL[index - 1],
    banks: userBanks,
  }));

  return userBanksWithEmail;
}
