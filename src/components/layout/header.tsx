"use client";

import MobileMenu from "./mobile-menu";
import { NotificationsOutlined } from "@mui/icons-material";
import { Avatar, Box, IconButton, Typography } from "@mui/material";

export default function Header() {
	return (
		<Box
			sx={{
				height: 72,
				px: { xs: 2, md: 3 },
				borderBottom: "1px solid",
				borderColor: "divider",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				bgcolor: "background.paper",
			}}
		>
			{/* Mobile navigation */}
			<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				<MobileMenu />

				<Typography
					sx={{
						display: { xs: "block", md: "none" },
						fontWeight: 700,
					}}
				>
					JEFF SYSTEMS
				</Typography>
			</Box>

			{/* User */}

			<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

				<Avatar sx={{ width: 36, height: 36 }}>S</Avatar>

				<Box sx={{ display: { xs: "none", sm: "block" } }}>
					<Typography variant='body2' sx={{ fontWeight: 600 }}>
						Saji Kumar
					</Typography>

					<Typography variant='caption' color='text.secondary'>
						Administrator
					</Typography>
				</Box>
			</Box>
		</Box>
	);
}
