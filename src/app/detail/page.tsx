import BaseTable from "@/components/base-table";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "../db/init";
import PrettyJSON from "@/components/pretty-json";

export default async function Page() {
  const user = await currentUser();

  const transaksiUser = await prisma.transaksi.findMany({
    where: {
      email: user?.emailAddresses[0].emailAddress,
    },
    include: {
      sumber: true,
      tujuan: true,
    },
  });

  const dataForTable = transaksiUser.map((transaksi, index) => ({
    id: transaksi.id,
    No: index + 1,
    Tanggal: transaksi.tanggal.toLocaleDateString(),
    Keterangan: transaksi.keterangan,
    Jenis: transaksi.jenis,
    Sumber: transaksi.sumber?.nama || "-",
    Tujuan: transaksi.tujuan?.nama || "-",
    Nominal: transaksi.nominal,
  }));

  return (
    <>
      <PrettyJSON text={transaksiUser} />
      <BaseTable
        columns={[
          { accessor: "No" },
          { accessor: "Tanggal" },
          { accessor: "Keterangan" },
          { accessor: "Jenis" },
          { accessor: "Sumber" },
          { accessor: "Tujuan" },
          { accessor: "Nominal" },
        ]}
        records={dataForTable}
      />
    </>
  );
}
