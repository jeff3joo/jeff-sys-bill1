"use client";

import {
	DashboardOutlined,
	Inventory2Outlined,
	ReceiptLongOutlined,
	SettingsOutlined,
	LogoutOutlined,
} from "@mui/icons-material";
import {
	Box,
	Divider,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navigationItems = [
	{
		label: "Dashboard",
		href: "/dashboard",
		icon: <DashboardOutlined />,
	},
	{
		label: "Products",
		href: "/products",
		icon: <Inventory2Outlined />,
	},
	{
		label: "Billing",
		href: "/billing",
		icon: <ReceiptLongOutlined />,
	},
	// {
	// 	label: "Settings",
	// 	href: "/settings",
	// 	icon: <SettingsOutlined />,
	// },
];

export default function Sidebar() {
	const router = useRouter();

	const supabase = createClient();

	const handleLogout = async () => {
		await supabase.auth.signOut();

		router.push("/login");
		router.refresh();
	};
	return (
		<Box
			sx={{
				width: 240,
				height: "100vh",
				flexShrink: 0,
				position: "fixed",
				top: 0,
				left: 0,
				borderRight: "1px solid",
				borderColor: "divider",
				display: "flex",
				flexDirection: "column",
				bgcolor: "background.paper",
			}}
		>
			<Box sx={{ px: 3, py: 3 }}>
				<Typography variant='h6' sx={{ fontWeight: 700 }}>
					JEFF SYSTEMS
				</Typography>

				<Typography variant='caption' color='text.secondary'>
					Billing Management
				</Typography>
			</Box>
			<Divider />
			<List sx={{ px: 1.5, py: 2 }}>
				{navigationItems.map((item) => (
					<ListItemButton
						key={item.label}
						component='a'
						href={item.href}
						sx={{
							borderRadius: 2,
							mb: 0.5,
						}}
					>
						<ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>

						<ListItemText primary={item.label} />
					</ListItemButton>
				))}
			</List>
			<Box sx={{ mt: "auto", p: 1.5 }}>
				<ListItemButton
					onClick={handleLogout}
					sx={{
						borderRadius: 2,
					}}
				>
					<ListItemIcon sx={{ minWidth: 40 }}>
						<LogoutOutlined />
					</ListItemIcon>

					<ListItemText primary='Logout' />
				</ListItemButton>
			</Box>
		</Box>
	);
}
