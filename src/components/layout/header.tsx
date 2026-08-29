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
				bgcolor: "#FFFFFF",
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
						component='img'
						src='/logo/logo.png'
						alt='Jeff Systems Logo'
						sx={{
							width: 28,
							height: 28,
							borderRadius: 1,
							objectFit: "contain",
							flexShrink: 0,
						}}
					/>
					<Typography
						sx={{
							fontWeight: 700,
							fontSize: "0.95rem",
							letterSpacing: "-0.01em",
							color: "#172033",
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
					px: 1.25,
					borderRadius: 2,
					bgcolor: "#F8FAFC",
					border: "1px solid",
					borderColor: "divider",
				}}
			>
				<Avatar
					sx={{
						width: 34,
						height: 34,
						bgcolor: "#0F1F33",
						color: "#FFFFFF",
						fontSize: "0.875rem",
						fontWeight: 700,
						border: "2px solid #FF5A00",
					}}
				>
					S
				</Avatar>

				<Box sx={{ display: { xs: "none", sm: "block" } }}>
					<Typography variant='body2' sx={{ fontWeight: 600, lineHeight: 1.2, color: "#172033" }}>
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
