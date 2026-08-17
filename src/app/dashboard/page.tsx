import {
	Box,
	Button,
	Card,
	CardContent,
	Grid,
	Stack,
	Typography,
} from "@mui/material";

import {
	AddOutlined,
	Inventory2Outlined,
	ReceiptLongOutlined,
	PointOfSaleOutlined,
} from "@mui/icons-material";

import AppShell from "@/components/layout/app-shell";

const stats = [
	{
		title: "Products",
		value: "0",
		description: "Products & services",
		icon: <Inventory2Outlined />,
	},
	{
		title: "Bills Today",
		value: "0",
		description: "Invoices generated",
		icon: <ReceiptLongOutlined />,
	},
	{
		title: "Today's Sales",
		value: "₹0",
		description: "Total sales today",
		icon: <PointOfSaleOutlined />,
	},
	{
		title: "Pending",
		value: "₹0",
		description: "Outstanding payments",
		icon: <ReceiptLongOutlined />,
	},
];

export default function DashboardPage() {
	return (
		<AppShell>
			<Stack spacing={4}>
				{/* Heading */}
				<Box>
					<Typography variant='h4' sx={{ fontWeight: 700 }}>
						Good afternoon, Saji 👋
					</Typography>

					<Typography color='text.secondary' sx={{ mt: 1 }}>
						Here's what's happening with Jeff Systems today.
					</Typography>
				</Box>

				{/* Statistics */}
				<Grid container spacing={2}>
					{stats.map((stat) => (
						<Grid key={stat.title} size={{ xs: 12, sm: 6, lg: 3 }}>
							<Card sx={{ height: "100%" }}>
								<CardContent>
									<Stack spacing={2}>
										<Box
											sx={{
												width: 42,
												height: 42,
												borderRadius: 2,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												bgcolor: "primary.main",
												color: "white",
											}}
										>
											{stat.icon}
										</Box>

										<Box>
											<Typography variant='body2' color='text.secondary'>
												{stat.title}
											</Typography>

											<Typography
												variant='h5'
												sx={{
													fontWeight: 700,
													mt: 0.5,
												}}
											>
												{stat.value}
											</Typography>

											<Typography variant='caption' color='text.secondary'>
												{stat.description}
											</Typography>
										</Box>
									</Stack>
								</CardContent>
							</Card>
						</Grid>
					))}
				</Grid>

				{/* Quick Actions */}
				<Box>
					<Typography variant='h6' sx={{ fontWeight: 700, mb: 2 }}>
						Quick Actions
					</Typography>

					<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
						<Button
							variant='contained'
							startIcon={<ReceiptLongOutlined />}
							href='/billing'
						>
							Create Bill
						</Button>

						<Button
							variant='outlined'
							startIcon={<AddOutlined />}
							href='/products'
						>
							Add Product
						</Button>
					</Stack>
				</Box>
			</Stack>
		</AppShell>
	);
}
