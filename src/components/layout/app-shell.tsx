import { Box } from "@mui/material";
import Sidebar from "./sidebar";
import Header from "./header";
import { ReactNode } from "react";

interface AppShellProps {
	children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
	return (
		<Box
			sx={{
				display: "flex",
				minHeight: "100vh",
				bgcolor: "background.default",
			}}
		>
			<Box
				sx={{
					display: { xs: "none", md: "block" },
					width: 240,
					flexShrink: 0,
				}}
			>
				<Sidebar />
			</Box>

			<Box
				sx={{
					flex: 1,
					minWidth: 0,
				}}
			>
				<Header />

				<Box
					component='main'
					sx={{
						p: { xs: 2, sm: 3, md: 4 },
					}}
				>
					{children}
				</Box>
			</Box>
		</Box>
	);
}
