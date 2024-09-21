'use client';

import { Button } from '@mantine/core';
import { useRouter } from 'next/navigation';
import MainCard from './main-card';

export default function FailedState() {
  const router = useRouter();

  const refreshPage = () => {
    router.refresh();
  };

  return (
    <MainCard>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">
          Gagal membuka halaman
        </h1>
        <div className="flex flex-row gap-2">
          <p className="mt-4 text-lg text-gray-700">Silahkan ulangi</p>
          <Button onClick={refreshPage}>Refresh halaman</Button>
        </div>
      </div>
    </MainCard>
  );
}
