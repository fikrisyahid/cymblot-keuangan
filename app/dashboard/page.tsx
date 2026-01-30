import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Container, Title, Text, Button, Group } from "@mantine/core";
import { logout } from "@/app/actions/auth";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <Container size="md" py="xl">
      <Title order={1} mb="md">
        Dashboard 🎉
      </Title>
      <Text size="lg" mb="xl">
        Selamat datang! Kamu berhasil login.
      </Text>
      <Text c="dimmed" mb="xl">
        User ID: {session.userId}
        <br />
        Email: {session.email}
      </Text>
      <Group>
        <form action={logout}>
          <Button type="submit" variant="light" color="red">
            Logout
          </Button>
        </form>
      </Group>
    </Container>
  );
}
