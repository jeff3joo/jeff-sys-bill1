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
			iconBg: "rgba(15, 31, 51, 0.06)",
			iconColor: "#0F1F33",
			valueColor: "#0F1F33",
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
			iconBg: "rgba(245, 158, 11, 0.1)",
			iconColor: "#D97706",
			valueColor: "#D97706",
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
			iconBg: "rgba(255, 90, 0, 0.08)",
			iconColor: "#FF5A00",
			valueColor: "#FF5A00",
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
			iconBg: "rgba(16, 185, 129, 0.1)",
			iconColor: "#10B981",
			valueColor: "#059669",
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
			iconBg: "rgba(79, 70, 229, 0.08)",
			iconColor: "#4F46E5",
			valueColor: "#4F46E5",
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
							color: "#172033",
						}}
					>
						{greetingTime}, Saji 👋
					</Typography>

					<Typography
						sx={{ mt: 0.5, fontSize: "0.95rem", color: "#64748B" }}
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
							color: "#64748B",
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
								bgcolor: "#FF5A00",
								color: "#FFFFFF",
								boxShadow: "0 2px 8px rgba(255, 90, 0, 0.28)",
								"&:hover": {
									bgcolor: "#E65100",
									boxShadow: "0 4px 12px rgba(255, 90, 0, 0.4)",
								},
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
								borderColor: "#CBD5E1",
								color: "#172033",
								"&:hover": {
									borderColor: "#94A3B8",
									bgcolor: "rgba(15, 31, 51, 0.04)",
								},
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
							color: "#64748B",
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
										bgcolor: "#FFFFFF",
										border: "1px solid #E2E8F0",
										transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
										"&:hover": {
											transform: "translateY(-2px)",
											boxShadow: "0 8px 16px -2px rgba(15, 31, 51, 0.08), 0 0 0 1px rgba(255, 90, 0, 0.15)",
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
																color: stat.valueColor || "text.primary",
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
															color: stat.valueColor || "text.primary",
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
