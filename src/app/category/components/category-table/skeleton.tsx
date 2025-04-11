import { Button, Skeleton } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export default function CategoryTableSkeleton() {
  return (
    <>
      <Button leftSection={<IconPlus />} className="sm:self-end" color="teal">
        Tambah Kategori
      </Button>
      <Skeleton height={400} />;
    </>
  );
}
