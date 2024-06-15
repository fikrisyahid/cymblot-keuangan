"use server";

import { revalidatePath } from "next/cache";

const routes = [
  "/dashboard",
  "/grafik",
  "/detail",
  "/detail/tambah",
  "/detail/penarikan-penyetoran",
  "/sumber-tujuan",
  "/bank",
];

export default async function revalidateAllRoute() {
  routes.forEach((route) => revalidatePath(route));
}
