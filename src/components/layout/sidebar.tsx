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
				borderColor: "divider",
				display: "flex",
				flexDirection: "column",
				bgcolor: "background.paper",
			}}
		>
			{/* Brand Header */}
			<Box sx={{ px: 2.5, py: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
				<Box
					sx={{
						width: 36,
						height: 36,
						borderRadius: 2,
						bgcolor: "primary.main",
						color: "#FFFFFF",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontWeight: 800,
						fontSize: "0.875rem",
						letterSpacing: "-0.02em",
						boxShadow: "0 2px 4px rgba(15, 23, 42, 0.15)",
					}}
				>
					JS
				</Box>
				<Box>
					<Typography
						variant='subtitle1'
						sx={{
							fontWeight: 700,
							lineHeight: 1.2,
							letterSpacing: "-0.01em",
						}}
					>
						JEFF SYSTEMS
					</Typography>
					<Typography
						variant='caption'
						color='text.secondary'
						sx={{ fontSize: "0.7rem", fontWeight: 500 }}
					>
						Billing Platform
					</Typography>
				</Box>
			</Box>

			<Divider />

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
								mb: 0.5,
								px: 1.5,
								py: 1,
								bgcolor: isActive ? "primary.main" : "transparent",
								color: isActive ? "#FFFFFF" : "text.secondary",
								fontWeight: isActive ? 600 : 500,
								boxShadow: isActive
									? "0 1px 3px rgba(15, 23, 42, 0.15)"
									: "none",
								transition: "all 0.15s ease-in-out",
								"&:hover": {
									bgcolor: isActive
										? "primary.main"
										: "rgba(15, 23, 42, 0.04)",
									color: isActive ? "#FFFFFF" : "text.primary",
								},
							}}
						>
							<ListItemIcon
								sx={{
									minWidth: 32,
									color: isActive ? "#FFFFFF" : "inherit",
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
			<Box sx={{ p: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
				<ListItemButton
					onClick={handleLogout}
					sx={{
						borderRadius: 2,
						px: 1.5,
						py: 1,
						color: "text.secondary",
						transition: "all 0.15s ease-in-out",
						"&:hover": {
							bgcolor: "error.light",
							color: "error.main",
							"& .MuiListItemIcon-root": {
								color: "error.main",
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
