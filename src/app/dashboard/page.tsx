"use client";

import {
	Box,
	Button,
	Card,
	CardActionArea,
	CardContent,
	Grid,
	Stack,
	Typography,
} from "@mui/material";

import {
	AddOutlined,
	ReceiptLongOutlined,
	HourglassEmptyOutlined,
	PaymentsOutlined,
	CalendarMonthOutlined,
	AccountBalanceWalletOutlined,
} from "@mui/icons-material";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import {
	getDashboardMetrics,
	type DashboardMetrics,
} from "@/lib/dashboard/dashboard-service";

export default function DashboardPage() {
	const [metrics, setMetrics] = useState<DashboardMetrics>({
		totalBills: 0,
		pendingCollection: 0,
		thisWeekCollection: 0,
		thisMonthCollection: 0,
		thisYearCollection: 0,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		async function loadMetrics() {
			try {
				const data = await getDashboardMetrics();
				if (isMounted) {
					setMetrics(data);
				}
			} catch (error) {
				console.error("Failed to load dashboard metrics:", error);
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		}

		void loadMetrics();

		return () => {
			isMounted = false;
		};
	}, []);

	const stats = [
		{
			title: "Total Bills Generated",
			value: loading ? "0" : metrics.totalBills.toLocaleString("en-IN"),
			description: "All invoices generated",
			icon: <ReceiptLongOutlined />,
		},
		{
			title: "Pending Collection",
			value: loading
				? "₹0"
				: `₹${metrics.pendingCollection.toLocaleString("en-IN", {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}`,
			description: "Unpaid & partially paid bills",
			icon: <HourglassEmptyOutlined />,
			href: "/bills?status=not_paid,partially_paid",
		},
		{
			title: "This Week's Collection",
			value: loading
				? "₹0"
				: `₹${metrics.thisWeekCollection.toLocaleString("en-IN", {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}`,
			description: "Payments received this week",
			icon: <PaymentsOutlined />,
		},
		{
			title: "This Month's Collection",
			value: loading
				? "₹0"
				: `₹${metrics.thisMonthCollection.toLocaleString("en-IN", {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}`,
			description: "Payments received this month",
			icon: <CalendarMonthOutlined />,
		},
		{
			title: "This Year's Collection",
			value: loading
				? "₹0"
				: `₹${metrics.thisYearCollection.toLocaleString("en-IN", {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}`,
			description: "Payments received this year",
			icon: <AccountBalanceWalletOutlined />,
		},
	];

	return (
		<AppShell>
			<Stack spacing={4}>
				{/* Heading */}
				<Box>
					<Typography variant='h4' sx={{ fontWeight: 700 }}>
						Good afternoon, Saji 👋
					</Typography>

					<Typography color='text.secondary' sx={{ mt: 1 }}>
						Here&apos;s what&apos;s happening with Jeff Systems today.
					</Typography>
				</Box>

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

				{/* Statistics */}
				<Grid container spacing={2}>
					{stats.map((stat) => (
						<Grid key={stat.title} size={{ xs: 12, sm: 6, md: 4 }}>
							<Card sx={{ height: "100%" }}>
								{stat.href ? (
									<CardActionArea
										href={stat.href}
										sx={{
											height: "100%",
											display: "flex",
											flexDirection: "column",
											alignItems: "stretch",
											justifyContent: "flex-start",
										}}
									>
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

													<Typography
														variant='caption'
														color='text.secondary'
													>
														{stat.description}
													</Typography>
												</Box>
											</Stack>
										</CardContent>
									</CardActionArea>
								) : (
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
								)}
							</Card>
						</Grid>
					))}
				</Grid>
			</Stack>
		</AppShell>
	);
}
