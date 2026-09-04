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
	ArrowForwardOutlined,
	LocationOnOutlined,
	PersonOutlined,
	ScheduleOutlined as ScheduleIcon,
} from "@mui/icons-material";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import {
	getDashboardMetrics,
	type DashboardMetrics,
} from "@/lib/dashboard/dashboard-service";
import { getTodayAppointments } from "@/lib/schedule/schedule-service";
import type { Appointment } from "@/types/schedule";

function formatVisitTime(timeStr: string): string {
	if (!timeStr) return "Time not set";
	const [h, m] = timeStr.split(":").map(Number);
	const p = h < 12 ? "AM" : "PM";
	const dh = h % 12 || 12;
	return `${dh}:${String(m).padStart(2, "0")} ${p}`;
}

function getDashboardApptDisplaySx(idx: number, total: number): Record<string, string> | string {
	if (idx === 0) return "block";
	if (idx === 1) return "block";

	if (idx === 2) {
		return {
			xs: "none",
			sm: "none",
			md: total === 3 ? "block" : "none",
			lg: "block",
		};
	}

	if (idx === 3) {
		return {
			xs: "none",
			sm: "none",
			md: "none",
			lg: total === 4 ? "block" : "none",
		};
	}

	return "none";
}

function getDashboardShowAllDisplaySx(total: number): Record<string, string> | string {
	if (total <= 2) return "none";

	return {
		xs: "block",
		sm: "block",
		md: total > 3 ? "block" : "none",
		lg: total > 4 ? "block" : "none",
	};
}

export default function DashboardPage() {
	const [metrics, setMetrics] = useState<DashboardMetrics>({
		totalBills: 0,
		pendingCollection: 0,
		thisWeekCollection: 0,
		thisMonthCollection: 0,
		thisYearCollection: 0,
	});
	const [loading, setLoading] = useState(true);
	const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
	const [scheduleLoading, setScheduleLoading] = useState(true);

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

		async function loadTodaySchedule() {
			try {
				const data = await getTodayAppointments();
				if (isMounted) {
					setTodayAppointments(data);
				}
			} catch (error) {
				console.error("Failed to load today's schedule:", error);
			} finally {
				if (isMounted) {
					setScheduleLoading(false);
				}
			}
		}

		void loadMetrics();
		void loadTodaySchedule();

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

	const activeTodayAppointments = todayAppointments.filter(
		(a) => a.status !== "completed",
	);

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
			iconColor: "#d90606",
			valueColor: "#d90606",
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
			iconBg: "rgba(16, 185, 129, 0.1)",
			iconColor: "#10B981",
			valueColor: "#059669",
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
						{greetingTime}
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

				{/* Today's Schedule */}
				<Box>
					<Stack
						direction='row'
						sx={{ mb: 1.5, justifyContent: "space-between", alignItems: "center" }}
					>
						<Typography
							variant='subtitle2'
							sx={{
								fontWeight: 700,
								textTransform: "uppercase",
								letterSpacing: "0.05em",
								fontSize: "0.75rem",
								color: "#64748B",
							}}
						>
							Today&apos;s Schedule
						</Typography>
						<Button
							href='/schedule'
							variant='text'
							size='small'
							endIcon={<ArrowForwardOutlined sx={{ fontSize: 14 }} />}
							sx={{
								color: "#FF5A00",
								fontWeight: 600,
								fontSize: "0.8rem",
								"&:hover": { bgcolor: "rgba(255, 90, 0, 0.06)" },
							}}
						>
							View Schedule
						</Button>
					</Stack>

					{scheduleLoading ? (
						<Card
							sx={{
								bgcolor: "#FFFFFF",
								border: "1px solid #E2E8F0",
								borderRadius: 2,
							}}
						>
							<CardContent sx={{ py: 3, textAlign: "center" }}>
								<Typography variant='body2' color='text.secondary'>
									Loading schedule...
								</Typography>
							</CardContent>
						</Card>
					) : activeTodayAppointments.length === 0 ? (
						<Card
							sx={{
								bgcolor: "#FFFFFF",
								border: "1px solid #E2E8F0",
								borderRadius: 2,
							}}
						>
							<CardContent sx={{ py: 3.5, textAlign: "center" }}>
								<ScheduleIcon
									sx={{ fontSize: 32, color: "#CBD5E1", mb: 1 }}
								/>
								<Typography variant='body2' color='text.secondary'>
									No visits scheduled for today.
								</Typography>
								<Button
									href='/schedule'
									variant='outlined'
									size='small'
									sx={{
										mt: 1.5,
										borderColor: "#CBD5E1",
										color: "#172033",
										fontSize: "0.8rem",
										"&:hover": { borderColor: "#94A3B8", bgcolor: "rgba(15, 31, 51, 0.04)" },
									}}
								>
									Add a visit
								</Button>
							</CardContent>
						</Card>
					) : (
						<Grid container spacing={{ xs: 1.5, sm: 2 }}>
							{activeTodayAppointments.slice(0, 4).map((appt, idx) => {
								const displaySx = getDashboardApptDisplaySx(idx, activeTodayAppointments.length);
								const colSize = activeTodayAppointments.length === 1 ? 12 : 6;

								return (
									<Grid
										key={appt.id}
										size={{
											xs: colSize,
											sm: 6,
											md: 4,
											lg: activeTodayAppointments.length === 3 ? 4 : 3,
										}}
										sx={{ display: displaySx }}
									>
										<Card
											sx={{
												width: "100%",
												height: "100%",
												bgcolor: "#FFFFFF",
												border: "1px solid #E2E8F0",
												borderRadius: 2,
												transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
												"&:hover": {
													borderColor: "rgba(255, 90, 0, 0.35)",
													boxShadow: "0 4px 12px rgba(15, 31, 51, 0.08)",
													transform: "translateY(-1px)",
												},
											}}
										>
											<CardActionArea
												href='/schedule'
												sx={{
													p: { xs: 1.5, sm: 1.75 },
													height: "100%",
													width: "100%",
													display: "flex",
													flexDirection: "column",
													alignItems: "flex-start",
													justifyContent: "space-between",
												}}
											>
												<Box sx={{ width: "100%", mb: 1 }}>
													<Stack direction='row' spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
														<Box
															sx={{
																width: 28,
																height: 28,
																borderRadius: 1.5,
																bgcolor: "rgba(255, 90, 0, 0.08)",
																display: "flex",
																alignItems: "center",
																justifyContent: "center",
																flexShrink: 0,
															}}
														>
															<PersonOutlined sx={{ fontSize: 16, color: "#FF5A00" }} />
														</Box>
														<Typography
															variant='subtitle2'
															sx={{
																fontWeight: 700,
																color: "#172033",
																fontSize: "0.85rem",
																lineHeight: 1.25,
																overflow: "hidden",
																textOverflow: "ellipsis",
																whiteSpace: "nowrap",
																flex: 1,
															}}
														>
															{appt.customer_name}
														</Typography>
													</Stack>
												</Box>

												<Stack spacing={0.5} sx={{ width: "100%" }}>
													<Stack direction='row' spacing={0.75} sx={{ alignItems: "center" }}>
														<ScheduleIcon sx={{ fontSize: 13, color: "#94A3B8", flexShrink: 0 }} />
														<Typography
															variant='caption'
															color='text.secondary'
															sx={{ fontSize: "0.725rem", fontWeight: 500 }}
														>
															{formatVisitTime(appt.visit_time)}
														</Typography>
													</Stack>
													{appt.location && (
														<Stack direction='row' spacing={0.75} sx={{ alignItems: "center" }}>
															<LocationOnOutlined sx={{ fontSize: 13, color: "#94A3B8", flexShrink: 0 }} />
															<Typography
																variant='caption'
																color='text.secondary'
																sx={{
																	fontSize: "0.725rem",
																	overflow: "hidden",
																	textOverflow: "ellipsis",
																	whiteSpace: "nowrap",
																}}
															>
																{appt.location}
															</Typography>
														</Stack>
													)}
												</Stack>
											</CardActionArea>
										</Card>
									</Grid>
								);
							})}

							{/* Show All Card */}
							{activeTodayAppointments.length > 2 && (
								<Grid
									size={{ xs: 12, sm: 12, md: 4, lg: 3 }}
									sx={{
										display: getDashboardShowAllDisplaySx(activeTodayAppointments.length),
									}}
								>
									<Card
										sx={{
											width: "100%",
											height: "100%",
											minHeight: { xs: 52, sm: 56, md: 84 },
											bgcolor: "#FFFFFF",
											border: "1.5px dashed #CBD5E1",
											borderRadius: 2,
											transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
											"&:hover": {
												borderColor: "#FF5A00",
												bgcolor: "rgba(255, 90, 0, 0.04)",
												transform: "translateY(-1px)",
												boxShadow: "0 4px 12px rgba(15, 31, 51, 0.06)",
											},
										}}
									>
										<CardActionArea
											href='/schedule'
											sx={{
												width: "100%",
												height: "100%",
												p: { xs: 1.25, sm: 1.5, md: 1.75 },
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<Stack
												direction='row'
												spacing={1.5}
												sx={{
													alignItems: "center",
													justifyContent: "center",
													width: "100%",
												}}
											>
												<Box
													sx={{
														width: { xs: 28, sm: 32 },
														height: { xs: 28, sm: 32 },
														borderRadius: "50%",
														bgcolor: "rgba(255, 90, 0, 0.1)",
														color: "#FF5A00",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														flexShrink: 0,
													}}
												>
													<ArrowForwardOutlined sx={{ fontSize: { xs: 15, sm: 17 } }} />
												</Box>
												<Box sx={{ minWidth: 0, textAlign: "left" }}>
													<Typography
														sx={{
															fontWeight: 700,
															fontSize: { xs: "0.825rem", sm: "0.85rem" },
															color: "#172033",
															lineHeight: 1.25,
															whiteSpace: "nowrap",
														}}
													>
														Show All ({activeTodayAppointments.length})
													</Typography>
													<Typography
														variant='caption'
														sx={{
															color: "#64748B",
															fontSize: "0.7rem",
															display: "block",
															lineHeight: 1.2,
															whiteSpace: "nowrap",
														}}
													>
														View schedule
													</Typography>
												</Box>
											</Stack>
										</CardActionArea>
									</Card>
								</Grid>
							)}
						</Grid>
					)}
				</Box>
			</Stack>
		</AppShell>
	);
}
