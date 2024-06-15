"use server";

import { currentUser } from "@clerk/nextjs/server";
import prisma from "../db/init";
import revalidateAllRoute from "./revalidate-all-route";

export async function addTujuan({ formData }: { formData: FormData }) {
  const user = await currentUser();
  if (user) {
    const { emailAddress: email } = user.emailAddresses[0];
    const nama = formData.get("tujuan")?.toString();

    if (nama) {
      await prisma.tujuan.create({
        data: {
          email,
          nama,
        },
      });

      revalidateAllRoute();
    }
  }
}

export async function editTujuan({ id, nama }: { id: string; nama: string }) {
  await prisma.tujuan.update({
    where: { id },
    data: { nama },
  });

  revalidateAllRoute();
}

export async function deleteTujuan({ id }: { id: string }) {
  await prisma.tujuan.delete({
    where: { id },
  });

  revalidateAllRoute();
}
