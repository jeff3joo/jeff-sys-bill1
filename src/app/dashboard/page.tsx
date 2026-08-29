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

	const currentHour = new Date().getHours();
	const greetingTime =
		currentHour < 12
			? "Good morning"
			: currentHour < 17
				? "Good afternoon"
				: "Good evening";

	const stats = [
		{
			title: "Total Bills Generated",
			value: loading ? "0" : metrics.totalBills.toLocaleString("en-IN"),
			description: "All invoices generated",
			icon: <ReceiptLongOutlined />,
			href: "/bills",
			iconBg: "rgba(15, 23, 42, 0.06)",
			iconColor: "#0F172A",
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
			iconBg: "rgba(217, 119, 6, 0.1)",
			iconColor: "#D97706",
			href: "/bills?status=not_paid,partially_paid",
			highlight: true,
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
			iconBg: "rgba(37, 99, 235, 0.08)",
			iconColor: "#2563EB",
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
			iconBg: "rgba(16, 185, 129, 0.08)",
			iconColor: "#10B981",
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
			iconBg: "rgba(99, 102, 241, 0.08)",
			iconColor: "#6366F1",
		},
	];

	return (
		<AppShell>
			<Stack spacing={{ xs: 3, sm: 4 }}>
				{/* Heading */}
				<Box>
					<Typography
						variant='h4'
						sx={{
							fontSize: { xs: "1.5rem", sm: "2rem" },
							fontWeight: 800,
							letterSpacing: "-0.025em",
						}}
					>
						{greetingTime}, Saji 👋
					</Typography>

					<Typography
						color='text.secondary'
						sx={{ mt: 0.5, fontSize: "0.95rem" }}
					>
						Here&apos;s what&apos;s happening with Jeff Systems today.
					</Typography>
				</Box>

				{/* Quick Actions */}
				<Box>
					<Typography
						variant='subtitle2'
						sx={{
							fontWeight: 700,
							mb: 1.5,
							textTransform: "uppercase",
							letterSpacing: "0.05em",
							fontSize: "0.75rem",
							color: "text.secondary",
						}}
					>
						Quick Actions
					</Typography>

					<Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
						<Button
							variant='contained'
							startIcon={<ReceiptLongOutlined />}
							href='/billing'
							sx={{
								width: { xs: "100%", sm: "auto" },
								px: 2.5,
								py: 1,
							}}
						>
							Create Bill
						</Button>

						<Button
							variant='outlined'
							startIcon={<AddOutlined />}
							href='/products'
							sx={{
								width: { xs: "100%", sm: "auto" },
								px: 2.5,
								py: 1,
							}}
						>
							Add Product
						</Button>
					</Stack>
				</Box>

				{/* Statistics */}
				<Box>
					<Typography
						variant='subtitle2'
						sx={{
							fontWeight: 700,
							mb: 1.5,
							textTransform: "uppercase",
							letterSpacing: "0.05em",
							fontSize: "0.75rem",
							color: "text.secondary",
						}}
					>
						Key Financial Overview
					</Typography>

					<Grid container spacing={{ xs: 2, sm: 2.5 }}>
						{stats.map((stat) => (
							<Grid key={stat.title} size={{ xs: 12, sm: 6, md: 4 }}>
								<Card
									sx={{
										height: "100%",
										transition: "all 0.2s ease-in-out",
										"&:hover": {
											transform: "translateY(-2px)",
											boxShadow: "0 6px 16px rgba(15, 23, 42, 0.07)",
											borderColor: "#CBD5E1",
										},
									}}
								>
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
											<CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
												<Stack
													direction={{ xs: "row", sm: "column" }}
													spacing={{ xs: 2, sm: 2 }}
													sx={{
														alignItems: { xs: "center", sm: "flex-start" },
													}}
												>
													<Box
														sx={{
															width: 44,
															height: 44,
															borderRadius: 2.5,
															display: "flex",
															alignItems: "center",
															justifyContent: "center",
															bgcolor: stat.iconBg,
															color: stat.iconColor,
															flexShrink: 0,
														}}
													>
														{stat.icon}
													</Box>

													<Box sx={{ minWidth: 0, flex: 1 }}>
														<Typography
															variant='body2'
															color='text.secondary'
															sx={{ fontWeight: 500 }}
														>
															{stat.title}
														</Typography>

														<Typography
															variant='h5'
															sx={{
																fontSize: { xs: "1.35rem", sm: "1.65rem" },
																fontWeight: 800,
																letterSpacing: "-0.02em",
																mt: 0.5,
																color: stat.highlight
																	? "warning.main"
																	: "text.primary",
															}}
														>
															{stat.value}
														</Typography>

														<Typography
															variant='caption'
															color='text.secondary'
															sx={{ mt: 0.25, display: "block" }}
														>
															{stat.description}
														</Typography>
													</Box>
												</Stack>
											</CardContent>
										</CardActionArea>
									) : (
										<CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
											<Stack
												direction={{ xs: "row", sm: "column" }}
												spacing={{ xs: 2, sm: 2 }}
												sx={{
													alignItems: { xs: "center", sm: "flex-start" },
												}}
											>
												<Box
													sx={{
														width: 44,
														height: 44,
														borderRadius: 2.5,
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														bgcolor: stat.iconBg,
														color: stat.iconColor,
														flexShrink: 0,
													}}
												>
													{stat.icon}
												</Box>

												<Box sx={{ minWidth: 0, flex: 1 }}>
													<Typography
														variant='body2'
														color='text.secondary'
														sx={{ fontWeight: 500 }}
													>
														{stat.title}
													</Typography>

													<Typography
														variant='h5'
														sx={{
															fontSize: { xs: "1.35rem", sm: "1.65rem" },
															fontWeight: 800,
															letterSpacing: "-0.02em",
															mt: 0.5,
														}}
													>
														{stat.value}
													</Typography>

													<Typography
														variant='caption'
														color='text.secondary'
														sx={{ mt: 0.25, display: "block" }}
													>
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
				</Box>
			</Stack>
		</AppShell>
	);
}
