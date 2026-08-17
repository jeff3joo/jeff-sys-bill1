"use client";

import { useState } from "react";
import { MenuOutlined } from "@mui/icons-material";
import { Box, Drawer, IconButton } from "@mui/material";

import Sidebar from "./sidebar";

export default function MobileMenu() {
	const [open, setOpen] = useState(false);

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<>
			<IconButton
				onClick={handleOpen}
				aria-label='Open navigation menu'
				sx={{
					display: { xs: "inline-flex", md: "none" },
				}}
			>
				<MenuOutlined />
			</IconButton>

			<Drawer anchor='left' open={open} onClose={handleClose}>
				<Box
					sx={{
						width: 260,
					}}
					role='presentation'
				>
					<Sidebar />
				</Box>
			</Drawer>
		</>
	);
}
