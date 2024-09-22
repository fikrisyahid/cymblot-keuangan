import { currentUser } from '@clerk/nextjs/server';

export default async function getSessionUsername() {
  const user = await currentUser();
  const username = `${user?.firstName} ${user?.lastName}`;
  return username || 'Guest';
}
