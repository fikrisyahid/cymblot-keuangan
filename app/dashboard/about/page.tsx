"use client";

import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  ThemeIcon,
  Badge,
  SimpleGrid,
  Divider,
  List,
  ListItem,
  Anchor,
  Box,
  Avatar,
  Timeline,
  TimelineItem,
  Table,
  TableThead,
  TableTbody,
  TableTr,
  TableTh,
  TableTd,
} from "@mantine/core";
import {
  IconCurrencyDollar,
  IconShieldLock,
  IconKey,
  IconLock,
  IconArrowsExchange,
  IconWallet,
  IconCategory,
  IconChartBar,
  IconReceipt,
  IconUsers,
  IconReportAnalytics,
  IconBrandGithub,
  IconExternalLink,
  IconUserCircle,
  IconLogin,
  IconDatabase,
  IconEye,
  IconPasswordFingerprint,
  IconBrandNextjs,
  IconBrandTypescript,
  IconServer,
} from "@tabler/icons-react";

export default function AboutPage() {
  const features = [
    {
      icon: IconWallet,
      color: "cyan",
      title: "Akun Keuangan",
      desc: "Kelola berbagai jenis akun: Tunai, Bank, E-Wallet, Kartu Kredit, dan Investasi.",
    },
    {
      icon: IconArrowsExchange,
      color: "teal",
      title: "Transaksi",
      desc: "Catat pemasukan & pengeluaran dengan filter berdasarkan tanggal, akun, kategori, dan kata kunci.",
    },
    {
      icon: IconCategory,
      color: "grape",
      title: "Kategori",
      desc: "Buat kategori kustom untuk pemasukan dan pengeluaran, lengkap dengan ikon dan warna.",
    },
    {
      icon: IconChartBar,
      color: "orange",
      title: "Anggaran",
      desc: "Tetapkan batas anggaran per kategori per bulan dan pantau realisasinya secara visual.",
    },
    {
      icon: IconReceipt,
      color: "indigo",
      title: "Transaksi Berulang",
      desc: "Atur transaksi otomatis berulang: harian, mingguan, bulanan, atau tahunan.",
    },
    {
      icon: IconUsers,
      color: "pink",
      title: "Utang & Piutang",
      desc: "Lacak utang dan piutang beserta sisa tagihan dan tanggal jatuh tempo.",
    },
    {
      icon: IconReportAnalytics,
      color: "violet",
      title: "Laporan",
      desc: "Analisis keuangan visual berupa grafik area, bar chart, dan donut chart.",
    },
    {
      icon: IconShieldLock,
      color: "red",
      title: "Enkripsi Data",
      desc: "Seluruh data keuangan dienkripsi. Bahkan admin server tidak bisa membaca data Anda.",
    },
  ];

  const encryptedData = [
    "Nama dan saldo akun keuangan",
    "Jumlah, deskripsi, dan catatan transaksi",
    "Nama kategori",
    "Jumlah anggaran",
    "Jumlah dan deskripsi transaksi berulang",
    "Nama, jumlah, sisa, dan deskripsi utang/piutang",
  ];

  const techStack = [
    { category: "Framework", tech: "Next.js 16 (App Router, Server Actions)" },
    { category: "UI", tech: "Mantine UI v8, Tabler Icons" },
    { category: "Chart", tech: "Mantine Charts (Recharts)" },
    { category: "ORM", tech: "Drizzle ORM" },
    { category: "Database", tech: "PostgreSQL" },
    { category: "Auth", tech: "JWT (jose) + Cookie Session" },
    { category: "Enkripsi", tech: "AES-256-GCM, PBKDF2 (Web Crypto API)" },
    { category: "Bahasa", tech: "TypeScript" },
  ];

  return (
    <>
      <Title order={2} mb="lg">
        Tentang Aplikasi
      </Title>

      <Stack gap="lg">
        {/* Hero Section */}
        <Paper
          p="xl"
          radius="lg"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -30,
              left: -30,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
            }}
          />
          <Box style={{ position: "relative", zIndex: 1 }}>
            <Group gap="md" mb="md">
              <Avatar
                size="lg"
                radius="xl"
                color="white"
                variant="white"
              >
                <IconCurrencyDollar size={28} color="#667eea" />
              </Avatar>
              <div>
                <Title order={2} c="white">
                  Cymblot Keuangan
                </Title>
                <Text c="rgba(255,255,255,0.8)" size="sm">
                  Aplikasi Manajemen Keuangan Pribadi
                </Text>
              </div>
            </Group>
            <Text c="white" size="md" maw={600}>
              Aplikasi keuangan pribadi berbasis web yang membantu Anda mengelola keuangan
              sehari-hari secara menyeluruh — mulai dari pencatatan transaksi, pengelolaan akun,
              anggaran bulanan, hingga pelacakan utang/piutang dan transaksi berulang.
            </Text>
            <Group mt="md" gap="xs">
              <Badge variant="white" color="dark" size="lg">
                v2.0
              </Badge>
              <Badge
                variant="white"
                color="dark"
                size="lg"
                leftSection={<IconBrandNextjs size={14} />}
              >
                Next.js 16
              </Badge>
              <Badge
                variant="white"
                color="dark"
                size="lg"
                leftSection={<IconBrandTypescript size={14} />}
              >
                TypeScript
              </Badge>
            </Group>
          </Box>
        </Paper>

        {/* Features */}
        <div>
          <Title order={3} mb="md">
            Fitur Utama
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {features.map((f, i) => (
              <Paper key={i} p="md" radius="md" withBorder>
                <Group gap="md" align="flex-start">
                  <ThemeIcon
                    size={42}
                    radius="md"
                    variant="light"
                    color={f.color}
                  >
                    <f.icon size={22} stroke={1.5} />
                  </ThemeIcon>
                  <div style={{ flex: 1 }}>
                    <Text fw={600} size="sm" mb={4}>
                      {f.title}
                    </Text>
                    <Text size="xs" c="dimmed" lh={1.5}>
                      {f.desc}
                    </Text>
                  </div>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        </div>

        <Divider />

        {/* Encryption Deep Dive */}
        <div>
          <Group gap="sm" mb="md">
            <ThemeIcon size={32} radius="md" variant="light" color="red">
              <IconShieldLock size={18} />
            </ThemeIcon>
            <Title order={3}>Privasi & Keamanan Data</Title>
          </Group>
          <Text c="dimmed" mb="lg">
            Aplikasi ini dirancang dengan prinsip <Text span fw={700} c="red">zero-knowledge encryption</Text> — artinya
            bahkan pemilik/admin server tidak dapat membaca data keuangan pengguna.
            Semua data sensitif terenkripsi di database.
          </Text>

          {/* Encryption specs */}
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="lg">
            <Paper p="md" radius="md" withBorder>
              <Group gap="sm" mb="xs">
                <ThemeIcon size={28} radius="sm" variant="light" color="blue">
                  <IconLock size={16} />
                </ThemeIcon>
                <Text fw={600} size="sm">Algoritma Enkripsi</Text>
              </Group>
              <Text size="sm" c="dimmed">AES-256-GCM (Authenticated Encryption)</Text>
            </Paper>
            <Paper p="md" radius="md" withBorder>
              <Group gap="sm" mb="xs">
                <ThemeIcon size={28} radius="sm" variant="light" color="orange">
                  <IconKey size={16} />
                </ThemeIcon>
                <Text fw={600} size="sm">Key Derivation</Text>
              </Group>
              <Text size="sm" c="dimmed">PBKDF2 dengan 600.000 iterasi</Text>
            </Paper>
            <Paper p="md" radius="md" withBorder>
              <Group gap="sm" mb="xs">
                <ThemeIcon size={28} radius="sm" variant="light" color="teal">
                  <IconPasswordFingerprint size={16} />
                </ThemeIcon>
                <Text fw={600} size="sm">Kunci Enkripsi</Text>
              </Group>
              <Text size="sm" c="dimmed">Diturunkan dari password pengguna (per-user key)</Text>
            </Paper>
            <Paper p="md" radius="md" withBorder>
              <Group gap="sm" mb="xs">
                <ThemeIcon size={28} radius="sm" variant="light" color="grape">
                  <IconServer size={16} />
                </ThemeIcon>
                <Text fw={600} size="sm">Crypto API</Text>
              </Group>
              <Text size="sm" c="dimmed">Web Crypto API (kompatibel Edge Runtime)</Text>
            </Paper>
          </SimpleGrid>

          {/* How it works */}
          <Text fw={600} mb="sm">Cara Kerja Enkripsi</Text>
          <Timeline active={4} bulletSize={28} lineWidth={2} mb="lg">
            <TimelineItem
              bullet={<IconUserCircle size={16} />}
              title={<Text size="sm" fw={600}>Saat Register</Text>}
            >
              <Text c="dimmed" size="xs" lh={1.5}>
                Sistem men-generate salt unik dan menurunkan encryption key dari password
                pengguna menggunakan PBKDF2. Sebuah verifier disimpan untuk validasi key saat login.
              </Text>
            </TimelineItem>
            <TimelineItem
              bullet={<IconLogin size={16} />}
              title={<Text size="sm" fw={600}>Saat Login</Text>}
            >
              <Text c="dimmed" size="xs" lh={1.5}>
                Password digunakan untuk menurunkan kembali encryption key yang sama.
                Key disimpan dalam encrypted cookie (bukan di database) selama sesi aktif.
              </Text>
            </TimelineItem>
            <TimelineItem
              bullet={<IconDatabase size={16} />}
              title={<Text size="sm" fw={600}>Saat Menyimpan Data</Text>}
            >
              <Text c="dimmed" size="xs" lh={1.5}>
                Semua data sensitif (nama akun, saldo, jumlah transaksi, deskripsi, nama
                kategori, dll.) dienkripsi dengan AES-256-GCM sebelum disimpan ke database.
              </Text>
            </TimelineItem>
            <TimelineItem
              bullet={<IconEye size={16} />}
              title={<Text size="sm" fw={600}>Saat Membaca Data</Text>}
            >
              <Text c="dimmed" size="xs" lh={1.5}>
                Data didekripsi di server menggunakan encryption key dari cookie,
                lalu dikirim ke browser dalam bentuk plaintext.
              </Text>
            </TimelineItem>
            <TimelineItem
              bullet={<IconPasswordFingerprint size={16} />}
              title={<Text size="sm" fw={600}>Saat Ubah Password</Text>}
            >
              <Text c="dimmed" size="xs" lh={1.5}>
                Seluruh data didekripsi dengan key lama, lalu di-re-enkripsi
                dengan key baru yang diturunkan dari password baru.
              </Text>
            </TimelineItem>
          </Timeline>

          {/* Encrypted fields */}
          <Text fw={600} mb="sm">Data yang Dienkripsi</Text>
          <Paper p="md" radius="md" withBorder mb="lg">
            <List spacing="xs" size="sm" icon={
              <ThemeIcon size={20} radius="xl" variant="light" color="green">
                <IconLock size={12} />
              </ThemeIcon>
            }>
              {encryptedData.map((item, i) => (
                <ListItem key={i}>{item}</ListItem>
              ))}
            </List>
          </Paper>

          {/* Warning */}
          <Paper
            p="md"
            radius="md"
            style={{
              borderLeft: "4px solid var(--mantine-color-yellow-6)",
              background: "var(--mantine-color-yellow-light)",
            }}
          >
            <Text fw={600} size="sm" mb={4}>
              Catatan Penting
            </Text>
            <List size="xs" spacing={4}>
              <ListItem>
                <Text size="xs">
                  <Text span fw={600}>Lupa password = kehilangan data.</Text>{" "}
                  Karena kunci enkripsi diturunkan dari password, tidak ada cara untuk
                  memulihkan data jika password hilang.
                </Text>
              </ListItem>
              <ListItem>
                <Text size="xs">
                  Data yang tersimpan di database berupa ciphertext yang tidak bisa dibaca
                  tanpa kunci yang benar.
                </Text>
              </ListItem>
              <ListItem>
                <Text size="xs">
                  Setiap pengguna memiliki kunci enkripsi berbeda, sehingga kompromi satu
                  akun tidak mempengaruhi akun lain.
                </Text>
              </ListItem>
            </List>
          </Paper>
        </div>

        <Divider />

        {/* Tech Stack */}
        <div>
          <Title order={3} mb="md">
            Teknologi
          </Title>
          <Paper radius="md" withBorder>
            <Table striped highlightOnHover>
              <TableThead>
                <TableTr>
                  <TableTh>Kategori</TableTh>
                  <TableTh>Teknologi</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {techStack.map((t, i) => (
                  <TableTr key={i}>
                    <TableTd fw={600}>{t.category}</TableTd>
                    <TableTd>{t.tech}</TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          </Paper>
        </div>

        <Divider />

        {/* Source Code */}
        <Paper p="lg" radius="md" withBorder>
          <Group justify="space-between" align="center">
            <Group gap="md">
              <ThemeIcon size={42} radius="md" variant="light" color="dark">
                <IconBrandGithub size={24} />
              </ThemeIcon>
              <div>
                <Text fw={600}>Source Code</Text>
                <Text size="sm" c="dimmed">
                  Lihat dan kontribusi di GitHub
                </Text>
              </div>
            </Group>
            <Anchor
              href="https://github.com/fs3120/cymblot-keuangan"
              target="_blank"
              rel="noopener noreferrer"
              underline="never"
            >
              <Group gap={4}>
                <Text size="sm" fw={500}>
                  Buka Repository
                </Text>
                <IconExternalLink size={16} />
              </Group>
            </Anchor>
          </Group>
        </Paper>

        {/* Footer */}
        <Text ta="center" size="xs" c="dimmed" pb="md">
          Cymblot Keuangan &copy; {new Date().getFullYear()} &middot; MIT License
        </Text>
      </Stack>
    </>
  );
}
