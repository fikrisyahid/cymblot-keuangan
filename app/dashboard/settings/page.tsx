import { Title, Text, Paper, Stack, Switch, Group } from "@mantine/core";

export default function SettingsPage() {
  return (
    <>
      <Title order={2} mb="lg">
        Pengaturan
      </Title>
      <Stack gap="md">
        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text fw={500}>Notifikasi</Text>
              <Text size="sm" c="dimmed">
                Aktifkan notifikasi untuk pengingat
              </Text>
            </div>
            <Switch defaultChecked />
          </Group>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text fw={500}>Mata Uang</Text>
              <Text size="sm" c="dimmed">
                IDR - Indonesian Rupiah
              </Text>
            </div>
          </Group>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text fw={500}>Versi Aplikasi</Text>
              <Text size="sm" c="dimmed">
                v0.1.0
              </Text>
            </div>
          </Group>
        </Paper>
      </Stack>
    </>
  );
}
