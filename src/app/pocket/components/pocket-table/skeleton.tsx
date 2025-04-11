import { Button, Skeleton } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import React from 'react';

export default function PocketTableSkeleton() {
  return (
    <>
      <Button leftSection={<IconPlus />} className="sm:self-end" color="teal">
        Tambah Kantong
      </Button>
      <Skeleton height={400} />
    </>
  );
}
