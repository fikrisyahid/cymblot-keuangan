'use client';

import { Button } from '@mantine/core';
import { BUTTON_BASE_COLOR } from '@/config/color';
import MainCard from './main-card';

export default function FailedState() {
  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <MainCard>
      <h1 className="text-center text-4xl font-bold text-red-600">
        Gagal membuka halaman
      </h1>
      <p className="text-center text-lg text-gray-700">
        Silahkan hubungi{' '}
        <a
          href="https://github.com/fs3120"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500"
        >
          Admin
        </a>{' '}
        atau ulangi
      </p>
      <Button color={BUTTON_BASE_COLOR} onClick={refreshPage}>
        Refresh halaman
      </Button>
    </MainCard>
  );
}
