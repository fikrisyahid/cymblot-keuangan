import { BUTTON_BASE_COLOR } from "@/config";
import { Alert, Button } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import Link from "next/link";

export default function CustomAlert({
  message,
  buttonString,
}: {
  message: string;
  buttonString: string;
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
        {message}
      </Alert>
      <Button
        component={Link}
        href="/detail/sumber-tujuan"
        style={{ backgroundColor: BUTTON_BASE_COLOR }}
      >
        {buttonString}
      </Button>
    </>
  );
}
