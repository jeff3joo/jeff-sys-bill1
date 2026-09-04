"use client";

import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Collapse,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	Grid,
	IconButton,
	InputAdornment,
	MenuItem,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import {
	AddOutlined,
	CalendarTodayOutlined,
	CheckCircleOutlined,
	ClearOutlined,
	DeleteOutlined,
	EditOutlined,
	ExpandLessOutlined,
	ExpandMoreOutlined,
	LocationOnOutlined,
	NotesOutlined,
	ScheduleOutlined,
	SearchOutlined,
	WarningAmberOutlined,
} from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import { getAppointments } from "@/lib/schedule/schedule-service";
import {
	createAppointment,
	deleteAppointment,
	markAppointmentComplete,
	updateAppointment,
} from "@/app/schedule/actions";
import type { Appointment, AppointmentFormData, VisitStatus } from "@/types/schedule";

// ─── Helpers ────────────────────────────────────────────────────────────────

function todayStr(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function tomorrowStr(): string {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayAfterTomorrowStr(): string {
	const d = new Date();
	d.setDate(d.getDate() + 2);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDisplayDate(dateStr: string): string {
	const [year, month, day] = dateStr.split("-").map(Number);
	return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

function formatShortDate(dateStr: string): string {
	const [year, month, day] = dateStr.split("-").map(Number);
	return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

function formatTime(timeStr: string): string {
	if (!timeStr) return "";
	const [h, m] = timeStr.split(":").map(Number);
	const period = h < 12 ? "AM" : "PM";
	const displayH = h % 12 || 12;
	return `${displayH}:${String(m).padStart(2, "0")} ${period}`;
}

function getTodayDisplayDate(): string {
	return new Date().toLocaleDateString("en-IN", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

const STATUS_CONFIG: Record<VisitStatus, { label: string; color: string; bg: string }> = {
	scheduled: { label: "Scheduled", color: "#FF5A00", bg: "rgba(255, 90, 0, 0.08)" },
	completed: { label: "Completed", color: "#059669", bg: "rgba(5, 150, 105, 0.08)" },
	cancelled: { label: "Cancelled", color: "#64748B", bg: "rgba(100, 116, 139, 0.08)" },
};

// ─── Visit Form Dialog ───────────────────────────────────────────────────────

const EMPTY_FORM: AppointmentFormData = {
	customer_name: "",
	visit_date: "",
	visit_time: "",
	location: "",
	notes: "",
	status: "scheduled",
};

interface VisitFormDialogProps {
	open: boolean;
	onClose: () => void;
	onSave: (data: AppointmentFormData) => Promise<void>;
	initialData?: AppointmentFormData;
	title: string;
	saving: boolean;
}

function VisitFormDialog({ open, onClose, onSave, initialData, title, saving }: VisitFormDialogProps) {
	const [form, setForm] = useState<AppointmentFormData>(
		initialData ?? { ...EMPTY_FORM, visit_date: todayStr() },
	);
	const [errors, setErrors] = useState<Partial<Record<keyof AppointmentFormData, string>>>({});

	const set = (field: keyof AppointmentFormData, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
	};

	const validate = (): boolean => {
		const e: Partial<Record<keyof AppointmentFormData, string>> = {};
		if (!form.customer_name.trim()) e.customer_name = "Customer name is required.";
		if (!form.visit_date) e.visit_date = "Date is required.";
		if (!form.visit_time) e.visit_time = "Time is required.";
		setErrors(e);
		return Object.keys(e).length === 0;
	};

	const handleSave = async () => {
		if (!validate()) return;
		await onSave(form);
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle sx={{ fontWeight: 700, color: "#172033", pb: 1 }}>{title}</DialogTitle>
			<DialogContent>
				<Stack spacing={2.5} sx={{ pt: 1 }}>
					<TextField
						label="Customer Name"
						value={form.customer_name}
						onChange={(e) => set("customer_name", e.target.value)}
						error={!!errors.customer_name}
						helperText={errors.customer_name}
						fullWidth
						required
						autoFocus
					/>
					<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
						<TextField
							label="Date"
							type="date"
							value={form.visit_date}
							onChange={(e) => set("visit_date", e.target.value)}
							error={!!errors.visit_date}
							helperText={errors.visit_date}
							fullWidth
							required
							slotProps={{ inputLabel: { shrink: true } }}
						/>
						<TextField
							label="Time"
							type="time"
							value={form.visit_time}
							onChange={(e) => set("visit_time", e.target.value)}
							error={!!errors.visit_time}
							helperText={errors.visit_time}
							fullWidth
							required
							slotProps={{ inputLabel: { shrink: true } }}
						/>
					</Stack>
					<TextField
						label="Location / Address"
						value={form.location}
						onChange={(e) => set("location", e.target.value)}
						fullWidth
						placeholder="e.g. Shop No. 12, MG Road, Bangalore"
					/>
					<TextField
						label="Purpose / Notes"
						value={form.notes}
						onChange={(e) => set("notes", e.target.value)}
						fullWidth
						multiline
						minRows={2}
						placeholder="e.g. Deliver invoice, discuss renewal..."
					/>
					<TextField
						select
						label="Status"
						value={form.status}
						onChange={(e) => set("status", e.target.value)}
						fullWidth
					>
						<MenuItem value="scheduled">Scheduled</MenuItem>
						<MenuItem value="completed">Completed</MenuItem>
						<MenuItem value="cancelled">Cancelled</MenuItem>
					</TextField>
				</Stack>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
				<Button variant="outlined" onClick={onClose} disabled={saving}>Cancel</Button>
				<Button
					variant="contained"
					onClick={handleSave}
					disabled={saving}
					sx={{ bgcolor: "#FF5A00", "&:hover": { bgcolor: "#E65100" }, boxShadow: "0 2px 8px rgba(255, 90, 0, 0.28)" }}
				>
					{saving ? "Saving..." : "Save Visit"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// ─── Appointment Card ────────────────────────────────────────────────────────

interface AppointmentCardProps {
	appt: Appointment;
	onEdit: (appt: Appointment) => void;
	onDelete: (appt: Appointment) => void;
	onComplete: (appt: Appointment) => void;
	isOverdue?: boolean;
}

function AppointmentCard({ appt, onEdit, onDelete, onComplete, isOverdue }: AppointmentCardProps) {
	const statusCfg = STATUS_CONFIG[appt.status];
	const isCompleted = appt.status === "completed";
	const isCancelled = appt.status === "cancelled";

	return (
		<Card
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				bgcolor: "#FFFFFF",
				border: isOverdue ? "1px solid rgba(245, 158, 11, 0.45)" : "1px solid #E2E8F0",
				borderRadius: 2,
				opacity: isCancelled ? 0.65 : 1,
				transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
				"@media (prefers-reduced-motion: reduce)": {
					transition: "none !important",
				},
				"&:hover": {
					boxShadow: "0 4px 12px rgba(15, 31, 51, 0.08)",
					borderColor: isOverdue ? "rgba(245, 158, 11, 0.65)" : "#CBD5E1",
				},
			}}
		>
			<CardContent
				sx={{
					p: { xs: 1.5, sm: 1.75 },
					display: "flex",
					flexDirection: "column",
					height: "100%",
					"&:last-child": { pb: { xs: 1.25, sm: 1.5 } },
				}}
			>
				{/* Header: Customer Name & Status */}
				<Box sx={{ mb: 0.85 }}>
					<Typography
						variant="subtitle2"
						sx={{
							fontWeight: 700,
							color: isCompleted ? "#64748B" : "#172033",
							textDecoration: isCancelled ? "line-through" : "none",
							fontSize: "0.875rem",
							lineHeight: 1.25,
							wordBreak: "break-word",
							mb: 0.65,
						}}
					>
						{appt.customer_name}
					</Typography>
					<Stack direction="row" spacing={0.5} sx={{ gap: 0.5, flexWrap: "wrap" }}>
						<Chip
							label={statusCfg.label}
							size="small"
							sx={{
								bgcolor: statusCfg.bg,
								color: statusCfg.color,
								fontWeight: 600,
								fontSize: "0.65rem",
								height: 20,
								px: 0.2,
							}}
						/>
						{isOverdue && (
							<Chip
								icon={<WarningAmberOutlined sx={{ fontSize: "11px !important" }} />}
								label="Overdue"
								size="small"
								sx={{
									bgcolor: "rgba(245, 158, 11, 0.1)",
									color: "#B45309",
									fontWeight: 600,
									fontSize: "0.65rem",
									height: 20,
									px: 0.2,
								}}
							/>
						)}
					</Stack>
				</Box>

				{/* Middle Info Details */}
				<Stack spacing={0.55} sx={{ flex: 1, mb: 1 }}>
					<Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
						<ScheduleOutlined sx={{ fontSize: 13, color: "#94A3B8", flexShrink: 0 }} />
						<Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.725rem", lineHeight: 1.25 }}>
							{appt.visit_time ? formatTime(appt.visit_time) : "Time not set"}
							{" · "}
							{formatShortDate(appt.visit_date)}
						</Typography>
					</Stack>
					{appt.location && (
						<Stack direction="row" spacing={0.75} sx={{ alignItems: "flex-start" }}>
							<LocationOnOutlined sx={{ fontSize: 13, color: "#94A3B8", flexShrink: 0, mt: 0.15 }} />
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{
									fontSize: "0.725rem",
									lineHeight: 1.25,
									wordBreak: "break-word",
									display: "-webkit-box",
									WebkitLineClamp: 2,
									WebkitBoxOrient: "vertical",
									overflow: "hidden",
								}}
							>
								{appt.location}
							</Typography>
						</Stack>
					)}
					{appt.notes && (
						<Stack direction="row" spacing={0.75} sx={{ alignItems: "flex-start" }}>
							<NotesOutlined sx={{ fontSize: 13, color: "#94A3B8", flexShrink: 0, mt: 0.15 }} />
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{
									fontSize: "0.725rem",
									lineHeight: 1.25,
									wordBreak: "break-word",
									display: "-webkit-box",
									WebkitLineClamp: 2,
									WebkitBoxOrient: "vertical",
									overflow: "hidden",
								}}
							>
								{appt.notes}
							</Typography>
						</Stack>
					)}
				</Stack>

				{/* Bottom Action Buttons */}
				<Stack
					direction="row"
					spacing={0.25}
					sx={{
						pt: 0.75,
						borderTop: "1px solid #F1F5F9",
						justifyContent: "flex-end",
						alignItems: "center",
						mt: "auto",
						flexShrink: 0,
					}}
				>
					{appt.status === "scheduled" && (
						<Tooltip title="Mark as Completed">
							<IconButton
								size="small"
								onClick={() => onComplete(appt)}
								sx={{ color: "#10B981", p: 0.4, "&:hover": { bgcolor: "rgba(16, 185, 129, 0.08)" } }}
							>
								<CheckCircleOutlined sx={{ fontSize: 16 }} />
							</IconButton>
						</Tooltip>
					)}
					<Tooltip title="Edit">
						<IconButton
							size="small"
							onClick={() => onEdit(appt)}
							sx={{ color: "#64748B", p: 0.4, "&:hover": { bgcolor: "rgba(15, 31, 51, 0.06)", color: "#172033" } }}
						>
							<EditOutlined sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Delete">
						<IconButton
							size="small"
							onClick={() => onDelete(appt)}
							sx={{ color: "#64748B", p: 0.4, "&:hover": { bgcolor: "rgba(239, 68, 68, 0.08)", color: "#EF4444" } }}
						>
							<DeleteOutlined sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
				</Stack>
			</CardContent>
		</Card>
	);
}

// ─── Helpers for Compact Row View ───────────────────────────────────────────

function getRow1CardDisplaySx(idx: number, total: number, expanded: boolean): Record<string, string> | string {
	if (idx === 0) return "block";
	if (idx === 1) return "block";

	if (idx === 2) {
		if (expanded) return { xs: "none", md: "block" };
		return total === 3
			? { xs: "none", sm: "none", md: "block" }
			: { xs: "none", sm: "none", md: "none", lg: "block" };
	}

	if (idx === 3) {
		if (expanded) return { xs: "none", lg: "block" };
		return total === 4 ? { xs: "none", lg: "block" } : "none";
	}

	return "none";
}

function getCollapseCardDisplaySx(actualIdx: number): Record<string, string> | string {
	if (actualIdx === 2) {
		return { xs: "block", sm: "block", md: "none" };
	}
	if (actualIdx === 3) {
		return { xs: "block", sm: "block", md: "block", lg: "none" };
	}
	return "block";
}

function getShowAllCardDisplaySx(total: number): Record<string, string> | string {
	if (total <= 2) return "none";
	const xsVal = "flex";
	const smVal = "flex";
	const mdVal = total > 3 ? "flex" : "none";
	const lgVal = total > 4 ? "flex" : "none";

	return { xs: xsVal, sm: smVal, md: mdVal, lg: lgVal };
}

// ─── Section (supports full expand or compact 1-row view with Collapse animation) ───

interface SectionProps {
	title: string;
	subtitle?: string;
	appointments: Appointment[];
	onEdit: (appt: Appointment) => void;
	onDelete: (appt: Appointment) => void;
	onComplete: (appt: Appointment) => void;
	accentColor?: string;
	isOverdue?: boolean;
	emptyMessage?: string;
	showEmpty?: boolean;
	compactRow?: boolean;
	chipIcon?: React.ReactElement;
}

function Section({
	title,
	subtitle,
	appointments,
	onEdit,
	onDelete,
	onComplete,
	accentColor = "#FF5A00",
	isOverdue,
	emptyMessage,
	showEmpty,
	compactRow = false,
	chipIcon,
}: SectionProps) {
	const [expanded, setExpanded] = useState(false);

	if (appointments.length === 0 && !showEmpty) return null;

	const hasHiddenCards = compactRow && appointments.length > 2;

	return (
		<Box>
			<Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
				<Box
					sx={{
						width: 3,
						height: 20,
						borderRadius: 2,
						bgcolor: appointments.length === 0 ? "#CBD5E1" : accentColor,
						flexShrink: 0,
					}}
				/>
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography
						variant="subtitle2"
						sx={{
							fontWeight: 700,
							color: appointments.length === 0 ? "#94A3B8" : "#172033",
							textTransform: "uppercase",
							letterSpacing: "0.05em",
							fontSize: "0.75rem",
						}}
					>
						{title}
					</Typography>
					{subtitle && (
						<Typography variant="caption" color="text.secondary">
							{subtitle}
						</Typography>
					)}
				</Box>
				{appointments.length > 0 && (
					<Chip
						icon={chipIcon}
						label={appointments.length}
						size="small"
						sx={{
							bgcolor: `${accentColor}18`,
							color: accentColor,
							fontWeight: 700,
							fontSize: "0.7rem",
							height: 22,
							...(chipIcon ? { pl: 0.5 } : {}),
						}}
					/>
				)}
				{hasHiddenCards && (
					<Button
						onClick={() => setExpanded((v) => !v)}
						size="small"
						endIcon={
							expanded ? (
								<ExpandLessOutlined sx={{ fontSize: 15 }} />
							) : (
								<ExpandMoreOutlined sx={{ fontSize: 15 }} />
							)
						}
						sx={{
							display: expanded
								? "inline-flex"
								: getShowAllCardDisplaySx(appointments.length),
							color: accentColor,
							fontWeight: 600,
							fontSize: "0.75rem",
							p: 0.5,
							textTransform: "none",
							"&:hover": { bgcolor: `${accentColor}0a` },
						}}
					>
						{expanded ? "Show Less" : `Show All (${appointments.length})`}
					</Button>
				)}
			</Stack>

			{appointments.length === 0 && showEmpty ? (
				<Card
					sx={{
						bgcolor: "#F8FAFC",
						border: "1px dashed #E2E8F0",
						boxShadow: "none",
					}}
				>
					<CardContent
						sx={{ textAlign: "center", py: 3, "&:last-child": { pb: 3 } }}
					>
						<Typography variant="body2" color="text.secondary">
							{emptyMessage ?? "No visits."}
						</Typography>
					</CardContent>
				</Card>
			) : !compactRow ? (
				/* Non-compact section (e.g. Today): all appointments rendered in standard grid */
				<Grid container spacing={{ xs: 1.5, sm: 2 }}>
					{appointments.map((appt) => (
						<Grid key={appt.id} size={{ xs: 6, sm: 6, md: 4, lg: 3 }}>
							<AppointmentCard
								appt={appt}
								onEdit={onEdit}
								onDelete={onDelete}
								onComplete={onComplete}
								isOverdue={isOverdue && appt.status === "scheduled"}
							/>
						</Grid>
					))}
				</Grid>
			) : (
				/* Compact row section: Row 1 + smooth animated Collapse */
				<Box>
					{/* Row 1 Grid */}
					<Grid container spacing={{ xs: 1.5, sm: 2 }}>
						{appointments.slice(0, 4).map((appt, idx) => {
							const displaySx = getRow1CardDisplaySx(idx, appointments.length, expanded);

							return (
								<Grid
									key={`row1-${appt.id}`}
									size={{ xs: 6, sm: 6, md: 4, lg: 3 }}
									sx={{ display: displaySx }}
								>
									<AppointmentCard
										appt={appt}
										onEdit={onEdit}
										onDelete={onDelete}
										onComplete={onComplete}
										isOverdue={isOverdue && appt.status === "scheduled"}
									/>
								</Grid>
							);
						})}

						{/* Compact Show All Card (at the end of the initial row) */}
						{appointments.length > 2 && (
							<Grid
								size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
								sx={{
									display: expanded ? "none" : getShowAllCardDisplaySx(appointments.length),
								}}
							>
								<Card
									onClick={() => setExpanded(true)}
									role="button"
									tabIndex={0}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											setExpanded(true);
										}
									}}
									sx={{
										width: "100%",
										height: "100%",
										minHeight: { xs: 44, sm: 120 },
										display: "flex",
										flexDirection: { xs: "row", sm: "column" },
										alignItems: "center",
										justifyContent: "center",
										gap: { xs: 1.25, sm: 0 },
										cursor: "pointer",
										bgcolor: "#FFFFFF",
										border: "1.5px dashed #CBD5E1",
										borderRadius: 2,
										p: { xs: 1.25, sm: 1.75 },
										textAlign: "center",
										transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
										"@media (prefers-reduced-motion: reduce)": {
											transition: "none !important",
										},
										"&:hover": {
											borderColor: accentColor,
											bgcolor: `${accentColor}08`,
											transform: "translateY(-1px)",
											boxShadow: "0 4px 12px rgba(15, 31, 51, 0.06)",
										},
									}}
								>
									<Box
										sx={{
											width: { xs: 26, sm: 32 },
											height: { xs: 26, sm: 32 },
											borderRadius: "50%",
											bgcolor: `${accentColor}14`,
											color: accentColor,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											mb: { xs: 0, sm: 0.75 },
											flexShrink: 0,
										}}
									>
										<ExpandMoreOutlined sx={{ fontSize: { xs: 18, sm: 20 } }} />
									</Box>
									<Typography
										sx={{
											fontWeight: 700,
											fontSize: { xs: "0.8rem", sm: "0.825rem" },
											color: "#172033",
										}}
									>
										Show All ({appointments.length})
									</Typography>
									<Typography
										variant="caption"
										sx={{
											display: { xs: "none", sm: "block" },
											color: "#64748B",
											fontSize: "0.7rem",
											mt: 0.25,
										}}
									>
										View all visits
									</Typography>
								</Card>
							</Grid>
						)}
					</Grid>

					{/* Smooth animated Collapse for remaining cards */}
					{appointments.length > 2 && (
						<Collapse
							in={expanded}
							timeout={250}
							sx={{
								"@media (prefers-reduced-motion: reduce)": {
									transitionDuration: "0ms !important",
								},
							}}
						>
							<Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ pt: { xs: 1.5, sm: 2 } }}>
								{appointments.slice(2).map((appt, idx) => {
									const actualIdx = idx + 2;
									const displaySx = getCollapseCardDisplaySx(actualIdx);

									return (
										<Grid
											key={`collapse-${appt.id}`}
											size={{ xs: 6, sm: 6, md: 4, lg: 3 }}
											sx={{ display: displaySx }}
										>
											<AppointmentCard
												appt={appt}
												onEdit={onEdit}
												onDelete={onDelete}
												onComplete={onComplete}
												isOverdue={isOverdue && appt.status === "scheduled"}
											/>
										</Grid>
									);
								})}

								{/* Show Less Card (at the end of expanded list) */}
								<Grid
									size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
									sx={{ display: "flex" }}
								>
									<Card
										onClick={() => setExpanded(false)}
										role="button"
										tabIndex={0}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												setExpanded(false);
											}
										}}
										sx={{
											width: "100%",
											height: "100%",
											minHeight: { xs: 44, sm: 120 },
											display: "flex",
											flexDirection: { xs: "row", sm: "column" },
											alignItems: "center",
											justifyContent: "center",
											gap: { xs: 1.25, sm: 0 },
											cursor: "pointer",
											bgcolor: "#FFFFFF",
											border: "1.5px dashed #CBD5E1",
											borderRadius: 2,
											p: { xs: 1.25, sm: 1.75 },
											textAlign: "center",
											transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
											"@media (prefers-reduced-motion: reduce)": {
												transition: "none !important",
											},
											"&:hover": {
												borderColor: accentColor,
												bgcolor: `${accentColor}08`,
												transform: "translateY(-1px)",
											},
										}}
									>
										<Box
											sx={{
												width: { xs: 26, sm: 32 },
												height: { xs: 26, sm: 32 },
												borderRadius: "50%",
												bgcolor: `${accentColor}14`,
												color: accentColor,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												mb: { xs: 0, sm: 0.75 },
												flexShrink: 0,
											}}
										>
											<ExpandLessOutlined sx={{ fontSize: { xs: 18, sm: 20 } }} />
										</Box>
										<Typography
											sx={{
												fontWeight: 700,
												fontSize: { xs: "0.8rem", sm: "0.825rem" },
												color: "#172033",
											}}
										>
											Show Less
										</Typography>
										<Typography
											variant="caption"
											sx={{
												display: { xs: "none", sm: "block" },
												color: "#64748B",
												fontSize: "0.7rem",
												mt: 0.25,
											}}
										>
											Collapse row
										</Typography>
									</Card>
								</Grid>
							</Grid>
						</Collapse>
					)}
				</Box>
			)}
		</Box>
	);
}

// ─── Collapsible Section (secondary) ─────────────────────────────────────────

interface CollapsibleSectionProps extends SectionProps {
	defaultExpanded?: boolean;
}

function CollapsibleSection({
	title,
	subtitle,
	appointments,
	onEdit,
	onDelete,
	onComplete,
	accentColor = "#0F1F33",
	isOverdue,
	defaultExpanded = false,
}: CollapsibleSectionProps) {
	const [expanded, setExpanded] = useState(defaultExpanded);

	if (appointments.length === 0) return null;

	return (
		<Box>
			<Button
				onClick={() => setExpanded((v) => !v)}
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1.5,
					mb: expanded ? 1.5 : 0,
					p: 0,
					textAlign: "left",
					justifyContent: "flex-start",
					width: "100%",
					color: "inherit",
					"&:hover": { bgcolor: "transparent" },
				}}
				disableRipple
			>
				<Box sx={{ width: 3, height: 20, borderRadius: 2, bgcolor: accentColor, flexShrink: 0 }} />
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#172033", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.75rem" }}>
						{title}
					</Typography>
					{subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
				</Box>
				<Chip
					label={appointments.length}
					size="small"
					sx={{ bgcolor: `${accentColor}20`, color: accentColor, fontWeight: 700, fontSize: "0.7rem", height: 20 }}
				/>
				<Box sx={{ color: "#94A3B8", display: "flex", alignItems: "center" }}>
					{expanded ? <ExpandLessOutlined fontSize="small" /> : <ExpandMoreOutlined fontSize="small" />}
				</Box>
			</Button>
			<Collapse
				in={expanded}
				timeout={250}
				sx={{
					"@media (prefers-reduced-motion: reduce)": {
						transitionDuration: "0ms !important",
					},
				}}
			>
				<Grid container spacing={{ xs: 1.5, sm: 2 }}>
					{appointments.map((appt) => (
						<Grid key={appt.id} size={{ xs: 6, sm: 6, md: 4, lg: 3 }}>
							<AppointmentCard appt={appt} onEdit={onEdit} onDelete={onDelete} onComplete={onComplete} isOverdue={isOverdue && appt.status === "scheduled"} />
						</Grid>
					))}
				</Grid>
			</Collapse>
		</Box>
	);
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function SchedulePage() {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// Search / filter
	const [searchQuery, setSearchQuery] = useState("");
	const [filterDate, setFilterDate] = useState("");

	// Form dialog
	const [formOpen, setFormOpen] = useState(false);
	const [dialogKey, setDialogKey] = useState(0);
	const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
	const [saving, setSaving] = useState(false);
	const [formError, setFormError] = useState("");

	// Delete dialog
	const [deletingAppt, setDeletingAppt] = useState<Appointment | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [deleteError, setDeleteError] = useState("");

	useEffect(() => {
		let mounted = true;
		async function load() {
			try {
				const data = await getAppointments();
				if (mounted) setAppointments(data);
			} catch (err) {
				if (mounted) {
					setError("Failed to load appointments. Please refresh.");
					console.error(err);
				}
			} finally {
				if (mounted) setLoading(false);
			}
		}
		void load();
		return () => { mounted = false; };
	}, []);

	// ── Date strings ──────────────────────────────────────────────────────────
	const today = todayStr();
	const tomorrow = tomorrowStr();
	const dayAfterTomorrow = dayAfterTomorrowStr();

	// ── Filter logic ──────────────────────────────────────────────────────────
	const isFiltering = searchQuery.trim().length > 0 || filterDate.length > 0;

	const filteredAppts = isFiltering
		? appointments.filter((a) => {
				const matchesSearch = searchQuery.trim()
					? a.customer_name.toLowerCase().includes(searchQuery.trim().toLowerCase())
					: true;
				const matchesDate = filterDate ? a.visit_date === filterDate : true;
				return matchesSearch && matchesDate;
			})
		: [];

	// ── Grouping ──────────────────────────────────────────────────────────────
	const overdueAppts = appointments.filter(
		(a) => a.visit_date < today && a.status === "scheduled",
	);
	const todayAppts = appointments.filter(
		(a) => a.visit_date === today && a.status === "scheduled",
	);
	const tomorrowAppts = appointments.filter(
		(a) => a.visit_date === tomorrow && a.status === "scheduled",
	);
	const upcomingAppts = appointments.filter(
		(a) => a.visit_date >= dayAfterTomorrow && a.status === "scheduled",
	);
	const completedAppts = appointments.filter((a) => a.status === "completed");
	const cancelledAppts = appointments.filter((a) => a.status === "cancelled");

	const hasAny = appointments.length > 0;

	// ── Handlers ──────────────────────────────────────────────────────────────
	const handleOpenAdd = () => {
		setEditingAppt(null);
		setFormError("");
		setDialogKey((k) => k + 1);
		setFormOpen(true);
	};

	const handleOpenEdit = (appt: Appointment) => {
		setEditingAppt(appt);
		setFormError("");
		setDialogKey((k) => k + 1);
		setFormOpen(true);
	};

	const handleFormSave = async (data: AppointmentFormData) => {
		setSaving(true);
		setFormError("");

		const tempId = `temp-${Date.now()}`;
		if (editingAppt) {
			setAppointments((prev) =>
				prev.map((a) => (a.id === editingAppt.id ? { ...editingAppt, ...data, updated_at: new Date().toISOString() } : a)),
			);
		} else {
			const optimistic: Appointment = { id: tempId, user_id: "", ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
			setAppointments((prev) =>
				[...prev, optimistic].sort((a, b) =>
					a.visit_date !== b.visit_date ? a.visit_date.localeCompare(b.visit_date) : a.visit_time.localeCompare(b.visit_time),
				),
			);
		}

		setFormOpen(false);

		try {
			if (editingAppt) {
				await updateAppointment(editingAppt.id, data);
			} else {
				await createAppointment(data);
			}
			const fresh = await getAppointments();
			setAppointments(fresh);
		} catch (err) {
			const fresh = await getAppointments();
			setAppointments(fresh);
			setFormError(err instanceof Error ? err.message : "Failed to save. Please try again.");
			setFormOpen(true);
		} finally {
			setSaving(false);
		}
	};

	const handleComplete = async (appt: Appointment) => {
		setAppointments((prev) => prev.map((a) => (a.id === appt.id ? { ...a, status: "completed" } : a)));
		try {
			await markAppointmentComplete(appt.id);
		} catch {
			const fresh = await getAppointments();
			setAppointments(fresh);
		}
	};

	const handleDeleteConfirm = async () => {
		if (!deletingAppt || deleteLoading) return;
		setDeleteLoading(true);
		setDeleteError("");
		const targetId = deletingAppt.id;
		setAppointments((prev) => prev.filter((a) => a.id !== targetId));
		setDeletingAppt(null);
		try {
			await deleteAppointment(targetId);
		} catch (err) {
			const fresh = await getAppointments();
			setAppointments(fresh);
			setDeleteError(err instanceof Error ? err.message : "Failed to delete. Please try again.");
		} finally {
			setDeleteLoading(false);
		}
	};

	const clearFilters = () => {
		setSearchQuery("");
		setFilterDate("");
	};

	return (
		<AppShell>
			<Stack spacing={{ xs: 3, sm: 3.5 }}>
				{/* Page Header */}
				<Stack
					direction={{ xs: "column", sm: "row" }}
					spacing={2}
					sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}
				>
					<Box>
						<Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", sm: "2rem" }, fontWeight: 800, letterSpacing: "-0.025em", color: "#172033" }}>
							Schedule
						</Typography>
						<Typography sx={{ mt: 0.5, fontSize: "0.95rem", color: "#64748B" }}>
							Keep track of your customer visits and upcoming tasks.
						</Typography>
						<Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 0.75 }}>
							<CalendarTodayOutlined sx={{ fontSize: 14, color: "#FF5A00" }} />
							<Typography variant="caption" sx={{ color: "#FF5A00", fontWeight: 600 }}>
								{getTodayDisplayDate()}
							</Typography>
						</Stack>
					</Box>
					<Button
						variant="contained"
						startIcon={<AddOutlined />}
						onClick={handleOpenAdd}
						sx={{
							bgcolor: "#FF5A00",
							color: "#FFFFFF",
							boxShadow: "0 2px 8px rgba(255, 90, 0, 0.28)",
							"&:hover": { bgcolor: "#E65100", boxShadow: "0 4px 12px rgba(255, 90, 0, 0.4)" },
							px: 2.5,
							py: 1,
							width: { xs: "100%", sm: "auto" },
						}}
					>
						Add Visit
					</Button>
				</Stack>

				{/* Search & Date Filter */}
				<Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ maxWidth: { md: 580 } }}>
					<TextField
						placeholder="Search by customer name..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						size="small"
						sx={{ flex: 1 }}
						slotProps={{
							input: {
								startAdornment: (
									<InputAdornment position="start">
										<SearchOutlined sx={{ fontSize: 18, color: "#94A3B8" }} />
									</InputAdornment>
								),
								endAdornment: searchQuery ? (
									<InputAdornment position="end">
										<IconButton size="small" onClick={() => setSearchQuery("")} edge="end">
											<ClearOutlined sx={{ fontSize: 16 }} />
										</IconButton>
									</InputAdornment>
								) : null,
							},
						}}
					/>
					<TextField
						type="date"
						value={filterDate}
						onChange={(e) => setFilterDate(e.target.value)}
						size="small"
						sx={{ width: { xs: "100%", sm: 180 } }}
						slotProps={{ inputLabel: { shrink: true } }}
						label="Filter by date"
					/>
					{isFiltering && (
						<Button variant="outlined" size="small" onClick={clearFilters} startIcon={<ClearOutlined />} sx={{ whiteSpace: "nowrap" }}>
							Clear
						</Button>
					)}
				</Stack>

				{/* Alerts */}
				{error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
				{deleteError && <Alert severity="error" onClose={() => setDeleteError("")}>{deleteError}</Alert>}

				{/* Loading */}
				{loading && (
					<Box sx={{ py: 6, textAlign: "center" }}>
						<Typography color="text.secondary">Loading schedule...</Typography>
					</Box>
				)}

				{/* Empty state — no appointments at all */}
				{!loading && !hasAny && (
					<Card sx={{ bgcolor: "#FFFFFF", border: "1px solid #E2E8F0", textAlign: "center", py: 8, px: 4 }}>
						<CalendarTodayOutlined sx={{ fontSize: 48, color: "#CBD5E1", mb: 2 }} />
						<Typography variant="h6" sx={{ fontWeight: 700, color: "#172033", mb: 0.75 }}>No visits scheduled yet</Typography>
						<Typography color="text.secondary" sx={{ mb: 3 }}>Add your first customer visit to get started.</Typography>
						<Button
							variant="contained"
							startIcon={<AddOutlined />}
							onClick={handleOpenAdd}
							sx={{ bgcolor: "#FF5A00", "&:hover": { bgcolor: "#E65100" }, boxShadow: "0 2px 8px rgba(255, 90, 0, 0.28)" }}
						>
							Add Visit
						</Button>
					</Card>
				)}

				{/* ── FILTER VIEW ── */}
				{!loading && hasAny && isFiltering && (
					<Box>
						<Typography variant="body2" sx={{ mb: 2, color: "#64748B" }}>
							{filteredAppts.length === 0
								? "No appointments match your search."
								: `${filteredAppts.length} appointment${filteredAppts.length !== 1 ? "s" : ""} found`}
						</Typography>
						<Grid container spacing={{ xs: 1.5, sm: 2 }}>
							{filteredAppts.map((appt) => (
								<Grid key={appt.id} size={{ xs: 6, sm: 6, md: 4, lg: 3 }}>
									<AppointmentCard
										appt={appt}
										onEdit={handleOpenEdit}
										onDelete={setDeletingAppt}
										onComplete={handleComplete}
										isOverdue={appt.visit_date < today && appt.status === "scheduled"}
									/>
								</Grid>
							))}
						</Grid>
					</Box>
				)}

				{/* ── MAIN SCHEDULE VIEW ── */}
				{!loading && hasAny && !isFiltering && (
					<Stack spacing={3.5}>
						{/* 1. Pending / Overdue — compact initial row with smooth Collapse animation */}
						<Section
							title="Pending / Overdue"
							subtitle="Past scheduled visits that still need attention"
							appointments={overdueAppts}
							onEdit={handleOpenEdit}
							onDelete={setDeletingAppt}
							onComplete={handleComplete}
							accentColor="#D97706"
							isOverdue
							compactRow
							chipIcon={<WarningAmberOutlined sx={{ fontSize: "12px !important" }} />}
						/>

						{/* 2. Today — primary focus, fully expanded */}
						<Section
							title="Today"
							subtitle={getTodayDisplayDate()}
							appointments={todayAppts}
							onEdit={handleOpenEdit}
							onDelete={setDeletingAppt}
							onComplete={handleComplete}
							accentColor="#FF5A00"
							showEmpty
							emptyMessage="No visits scheduled for today."
						/>

						{/* 3. Tomorrow — compact initial row with smooth Collapse animation */}
						<Section
							title="Tomorrow"
							subtitle={formatDisplayDate(tomorrow)}
							appointments={tomorrowAppts}
							onEdit={handleOpenEdit}
							onDelete={setDeletingAppt}
							onComplete={handleComplete}
							accentColor="#4F46E5"
							showEmpty
							emptyMessage="No visits scheduled for tomorrow."
							compactRow
						/>

						{/* 4. Upcoming — collapsible */}
						<CollapsibleSection
							title="Upcoming"
							subtitle="From day after tomorrow onwards"
							appointments={upcomingAppts}
							onEdit={handleOpenEdit}
							onDelete={setDeletingAppt}
							onComplete={handleComplete}
							accentColor="#0F1F33"
							defaultExpanded={upcomingAppts.length > 0 && upcomingAppts.length <= 6}
						/>

						{/* History divider */}
						{(completedAppts.length > 0 || cancelledAppts.length > 0) && (
							<Divider sx={{ borderColor: "#E2E8F0" }}>
								<Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", px: 1 }}>
									History
								</Typography>
							</Divider>
						)}

						{/* 5. Completed — collapsible */}
						<CollapsibleSection
							title="Completed"
							appointments={completedAppts}
							onEdit={handleOpenEdit}
							onDelete={setDeletingAppt}
							onComplete={handleComplete}
							accentColor="#059669"
						/>

						{/* 6. Cancelled — collapsible */}
						<CollapsibleSection
							title="Cancelled"
							appointments={cancelledAppts}
							onEdit={handleOpenEdit}
							onDelete={setDeletingAppt}
							onComplete={handleComplete}
							accentColor="#94A3B8"
						/>
					</Stack>
				)}
			</Stack>

			{/* Form error */}
			{formError && !formOpen && (
				<Alert severity="error" onClose={() => setFormError("")} sx={{ mt: 2 }}>{formError}</Alert>
			)}

			{/* Add / Edit Dialog */}
			<VisitFormDialog
				key={dialogKey}
				open={formOpen}
				onClose={() => { setFormOpen(false); setFormError(""); }}
				onSave={handleFormSave}
				initialData={
					editingAppt
						? {
								customer_name: editingAppt.customer_name,
								visit_date: editingAppt.visit_date,
								visit_time: editingAppt.visit_time,
								location: editingAppt.location,
								notes: editingAppt.notes,
								status: editingAppt.status,
							}
						: undefined
				}
				title={editingAppt ? "Edit Visit" : "Add Visit"}
				saving={saving}
			/>

			{/* Delete Confirmation Dialog */}
			<Dialog open={!!deletingAppt} onClose={() => { if (!deleteLoading) setDeletingAppt(null); }} maxWidth="xs" fullWidth>
				<DialogTitle sx={{ fontWeight: 700, color: "#172033" }}>Delete Visit?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete the visit for{" "}
						<strong>{deletingAppt?.customer_name}</strong> on{" "}
						{deletingAppt ? formatDisplayDate(deletingAppt.visit_date) : ""}? This cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
					<Button variant="outlined" onClick={() => setDeletingAppt(null)} disabled={deleteLoading}>Cancel</Button>
					<Button
						variant="contained"
						onClick={handleDeleteConfirm}
						disabled={deleteLoading}
						sx={{ bgcolor: "#EF4444", "&:hover": { bgcolor: "#B91C1C" }, "&:disabled": { bgcolor: "#FCA5A5" } }}
					>
						{deleteLoading ? "Deleting..." : "Delete"}
					</Button>
				</DialogActions>
			</Dialog>
		</AppShell>
	);
}
