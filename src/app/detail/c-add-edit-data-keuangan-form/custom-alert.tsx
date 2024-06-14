import { Alert, Button, Stack } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import Link from "next/link";

export default function CustomAlert({
  message,
  buttonString,
  href,
}: {
  message: string;
  buttonString: string;
  href: string;
}) {
  return (
    <>
      <Alert
        variant="filled"
        color="indigo"
        title="Info"
        icon={<IconInfoCircle />}
        p="xs"
      >
        <Stack align="start">
          {message}
          <Button
            component={Link}
            href={href}
            color="teal"
          >
            {buttonString}
          </Button>
        </Stack>
      </Alert>
    </>
  );
}
