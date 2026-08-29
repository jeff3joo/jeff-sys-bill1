"use client";

import {
	Box,
	Divider,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
} from "@mui/material";

import {
	DashboardOutlined,
	Inventory2Outlined,
	ReceiptLongOutlined,
	LogoutOutlined,
	HistoryOutlined,
} from "@mui/icons-material";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navigationItems = [
	{
		label: "Dashboard",
		href: "/dashboard",
		icon: <DashboardOutlined fontSize='small' />,
	},
	{
		label: "Products",
		href: "/products",
		icon: <Inventory2Outlined fontSize='small' />,
	},
	{
		label: "Billing",
		href: "/billing",
		icon: <ReceiptLongOutlined fontSize='small' />,
	},
	{
		label: "History",
		href: "/bills",
		icon: <HistoryOutlined fontSize='small' />,
	},
];

export default function Sidebar() {
	const router = useRouter();
	const pathname = usePathname();
	const supabase = createClient();

	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.push("/login");
		router.refresh();
	};

	return (
		<Box
			sx={{
				width: { xs: 260, md: 240 },
				height: "100vh",
				flexShrink: 0,
				position: { xs: "static", md: "fixed" },
				top: 0,
				left: 0,
				borderRight: "1px solid",
				borderColor: "rgba(255, 255, 255, 0.08)",
				display: "flex",
				flexDirection: "column",
				bgcolor: "#0F1F33",
			}}
		>
			{/* Brand Header */}
			<Box sx={{ px: 2.5, py: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
				<Box
					component='img'
					src='/logo/logo.png'
					alt='Jeff Systems Logo'
					sx={{
						width: 36,
						height: 36,
						borderRadius: 1.5,
						objectFit: "contain",
						flexShrink: 0,
					}}
				/>
				<Box>
					<Typography
						variant='subtitle1'
						sx={{
							fontWeight: 700,
							lineHeight: 1.2,
							letterSpacing: "-0.01em",
							color: "#FFFFFF",
						}}
					>
						JEFF SYSTEMS
					</Typography>
					<Typography
						variant='caption'
						sx={{ fontSize: "0.7rem", fontWeight: 500, color: "#94A3B8" }}
					>
						Billing Platform
					</Typography>
				</Box>
			</Box>

			<Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)" }} />

			{/* Navigation List */}
			<List sx={{ px: 1.5, py: 2, flex: 1 }}>
				{navigationItems.map((item) => {
					const isActive =
						pathname === item.href ||
						(item.href !== "/dashboard" && pathname.startsWith(item.href));

					return (
						<ListItemButton
							key={item.label}
							component='a'
							href={item.href}
							sx={{
								borderRadius: 2,
								mb: 0.75,
								px: 1.5,
								py: 1,
								bgcolor: isActive ? "rgba(255, 90, 0, 0.14)" : "transparent",
								color: isActive ? "#FF6A00" : "#94A3B8",
								border: isActive
									? "1px solid rgba(255, 90, 0, 0.35)"
									: "1px solid transparent",
								boxShadow: isActive
									? "0 0 12px rgba(255, 90, 0, 0.15)"
									: "none",
								transition: "all 0.15s ease-in-out",
								"&:hover": {
									bgcolor: isActive
										? "rgba(255, 90, 0, 0.22)"
										: "rgba(255, 255, 255, 0.06)",
									color: isActive ? "#FF7A29" : "#FFFFFF",
									borderColor: isActive
										? "rgba(255, 90, 0, 0.5)"
										: "transparent",
								},
							}}
						>
							<ListItemIcon
								sx={{
									minWidth: 32,
									color: isActive ? "#FF6A00" : "inherit",
									transition: "color 0.15s ease-in-out",
								}}
							>
								{item.icon}
							</ListItemIcon>

							<ListItemText
								primary={item.label}
								sx={{
									"& .MuiListItemText-primary": {
										fontSize: "0.875rem",
										fontWeight: isActive ? 600 : 500,
									},
								}}
							/>
						</ListItemButton>
					);
				})}
			</List>

			{/* Bottom Section */}
			<Box sx={{ p: 1.5, borderTop: "1px solid", borderColor: "rgba(255, 255, 255, 0.08)" }}>
				<ListItemButton
					onClick={handleLogout}
					sx={{
						borderRadius: 2,
						px: 1.5,
						py: 1,
						color: "#94A3B8",
						transition: "all 0.15s ease-in-out",
						"&:hover": {
							bgcolor: "rgba(239, 68, 68, 0.15)",
							color: "#EF4444",
							"& .MuiListItemIcon-root": {
								color: "#EF4444",
							},
						},
					}}
				>
					<ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
						<LogoutOutlined fontSize='small' />
					</ListItemIcon>

					<ListItemText
						primary='Logout'
						sx={{
							"& .MuiListItemText-primary": {
								fontSize: "0.875rem",
								fontWeight: 500,
							},
						}}
					/>
				</ListItemButton>
			</Box>
		</Box>
	);
}
