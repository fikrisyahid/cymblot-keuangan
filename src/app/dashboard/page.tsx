import { NumberFormatter, Stack, Text, Title } from '@mantine/core';
import getSessionUsername from '@/utils/get-session-username';
import getSessionEmail from '@/utils/get-session-email';
import { Pocket } from '@prisma/client';

import MainCard from '../components/main-card';
import getTotalBalance from '../actions/functions/get-total-balance';
import AccessBlocked from '../components/access-blocked';
import FailedState from '../components/failed-state';
import { getPocket } from '../actions/db/pocket';
import getPocketBalance from '../actions/functions/get-pocket-balance';
import BalancePerPocket from './balance-per-pocket';

export default async function Page() {
  const username = await getSessionUsername();
  const email = await getSessionEmail();

  if (!email) {
    return <AccessBlocked />;
  }

  const pockets = (await getPocket({ email })) as Pocket[];

  if (!pockets) {
    return <FailedState />;
  }

  const pocketsWithBalance = await Promise.all(
    pockets.map(async (pocket: Pocket) => ({
      ...pocket,
      balance: await getPocketBalance({
        id: pocket.id,
      }),
    })),
  );

  const totalBalance = await getTotalBalance({ email });

  return (
    <Stack>
      <MainCard>
        <Title className="text-center sm:text-start">Halo {username}</Title>
        <MainCard row transparent noPadding wrap>
          <MainCard style={{ backgroundColor: '#38598b' }} fullWidth>
            <Title c="white" className="text-center sm:text-start">
              Total saldo
            </Title>
            <Text
              c={totalBalance > 0 ? 'green' : 'red'}
              size="lg"
              fw={700}
              className="text-center sm:text-start"
            >
              <NumberFormatter
                value={totalBalance}
                prefix="Rp "
                thousandSeparator
              />
            </Text>
          </MainCard>
        </MainCard>
      </MainCard>
      <MainCard row transparent noPadding>
        <MainCard width="50%">
          <Stack gap={0} className="text-center sm:text-start">
            <Text fw={700} size="xl">
              Saldo tiap kantong
            </Text>
            <Text>
              Saldo yang terdapat pada setiap kantong yang Anda miliki
            </Text>
          </Stack>
          <BalancePerPocket pocketsWithBalance={pocketsWithBalance} />
        </MainCard>
        <MainCard width="50%">
          <Stack gap={0} className="text-center sm:text-start">
            <Text fw={700} size="xl">
              Riwayat transaksi terbaru
            </Text>
          </Stack>
        </MainCard>
      </MainCard>
    </Stack>
  );
}
