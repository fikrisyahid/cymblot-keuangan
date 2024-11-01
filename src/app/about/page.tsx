import {
  ActionIcon,
  Group,
  List,
  ListItem,
  rem,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTelegram,
  IconCheck,
} from '@tabler/icons-react';
import MainCard from '../components/main-card';

export const metadata = {
  title: 'Tentang',
};

export default function Page() {
  return (
    <MainCard transparent noPadding>
      <MainCard>
        <Title className="text-center">Tentang Aplikasi</Title>
        <Text className="text-center">
          Aplikasi Keuangan Cymblot adalah solusi sederhana dan praktis untuk
          membantu Anda mengelola keuangan sehari-hari
        </Text>
        <Text className="text-center">
          Semoga aplikasi ini dapat bermanfaat bagi Anda dalam mengelola
          keuangan
        </Text>
      </MainCard>
      <MainCard>
        <Title className="text-center">Fitur Aplikasi</Title>
        <List
          spacing="xs"
          withPadding
          icon={
            <ThemeIcon color="teal" size={24} radius="xl">
              <IconCheck style={{ width: rem(16), height: rem(16) }} />
            </ThemeIcon>
          }
        >
          <ListItem>Pelacakan saldo</ListItem>
          <ListItem>
            Pengelompokan pemasukan dan pengeluaran dengan periode
          </ListItem>
          <ListItem>Visualisasi data dalam bentuk grafik</ListItem>
          <ListItem>Filter data mentah keuangan</ListItem>
        </List>
      </MainCard>
      <MainCard>
        <Title className="text-center">Kontak</Title>
        <Text className="text-center">
          Hubungi saya melalui media sosial berikut untuk memberikan masukan,
          saran, atau pertanyaan 😁
        </Text>
        <Group className="self-center">
          <a
            href="https://github.com/fikrisyahid/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ActionIcon variant="subtle" color="black" size="lg" radius="xl">
              <IconBrandGithub />
            </ActionIcon>
          </a>
          <a
            href="https://t.me/fikrisyahid14"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ActionIcon variant="subtle" color="black" size="lg" radius="xl">
              <IconBrandTelegram />
            </ActionIcon>
          </a>
          <a
            href="https://www.linkedin.com/in/muhammad-fikri-syahid/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ActionIcon variant="subtle" color="black" size="lg" radius="xl">
              <IconBrandLinkedin />
            </ActionIcon>
          </a>
        </Group>
      </MainCard>
    </MainCard>
  );
}
