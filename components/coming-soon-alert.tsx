import { Alert } from "@mantine/core";
import { IconRocket } from "@tabler/icons-react";

interface ComingSoonAlertProps {
	title?: string;
	message?: string;
}

export default function ComingSoonAlert({
	title = "Coming Soon",
	message = "Fitur ini akan segera tersedia. Nantikan update berikutnya!",
}: ComingSoonAlertProps) {
	return (
		<Alert
			icon={<IconRocket size={16} />}
			title={title}
			color="blue"
			variant="light"
		>
			{message}
		</Alert>
	);
}
