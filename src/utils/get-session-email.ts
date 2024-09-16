import { currentUser } from '@clerk/nextjs/server';

export default async function getSessionEmail() {
  const user = await currentUser();
  return user?.emailAddresses[0].emailAddress;
}
