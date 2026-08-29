"use client";

import MobileMenu from "./mobile-menu";
import { Avatar, Box, Typography } from "@mui/material";

export default function Header() {
	return (
		<Box
			sx={{
				height: { xs: 58, sm: 66 },
				px: { xs: 2, sm: 3, md: 4 },
				borderBottom: "1px solid",
				borderColor: "divider",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				bgcolor: "background.paper",
				position: "sticky",
				top: 0,
				zIndex: 10,
			}}
		>
			{/* Mobile navigation brand */}
			<Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
				<MobileMenu />

				<Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1 }}>
					<Box
						sx={{
							width: 28,
							height: 28,
							borderRadius: 1.5,
							bgcolor: "primary.main",
							color: "#FFFFFF",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontWeight: 800,
							fontSize: "0.75rem",
						}}
					>
						JS
					</Box>
					<Typography
						sx={{
							fontWeight: 700,
							fontSize: "0.95rem",
							letterSpacing: "-0.01em",
						}}
					>
						JEFF SYSTEMS
					</Typography>
				</Box>
			</Box>

			{/* User Profile */}
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1.25,
					py: 0.5,
					px: 1,
					borderRadius: 2,
				}}
			>
				<Avatar
					sx={{
						width: 34,
						height: 34,
						bgcolor: "primary.main",
						color: "#FFFFFF",
						fontSize: "0.875rem",
						fontWeight: 700,
					}}
				>
					S
				</Avatar>

				<Box sx={{ display: { xs: "none", sm: "block" } }}>
					<Typography variant='body2' sx={{ fontWeight: 600, lineHeight: 1.2 }}>
						Saji Kumar
					</Typography>

					<Typography
						variant='caption'
						color='text.secondary'
						sx={{ fontSize: "0.72rem", fontWeight: 500 }}
					>
						Administrator
					</Typography>
				</Box>
			</Box>
		</Box>
	);
}
