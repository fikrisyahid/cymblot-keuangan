'use server';

import { revalidatePath } from 'next/cache';

const routes = ['/category'];

export default async function revalidateAllRoute() {
  routes.forEach((route) => revalidatePath(route));
}
