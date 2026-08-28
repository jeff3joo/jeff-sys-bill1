"use client";

import {
	Alert,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	Typography,
} from "@mui/material";
import { FileDownloadOutlined } from "@mui/icons-material";
import { useState } from "react";
import JSZip from "jszip";
import {
	formatInvoiceForPdf,
	getInvoicesForMonth,
} from "@/lib/invoices/invoice-service";
import { createInvoicePdf } from "@/lib/pdf/invoice";

interface MonthlyExportDialogProps {
	open: boolean;
	onClose: () => void;
}

interface MonthOption {
	label: string;
	value: string;
	year: number;
	monthIndex: number;
}

function getMonthOptions(): MonthOption[] {
	const options: MonthOption[] = [];
	const now = new Date();
	const currentYear = now.getFullYear();
	const currentMonth = now.getMonth();

	// Generate past 36 months starting from current month
	for (let i = 0; i < 36; i++) {
		const date = new Date(currentYear, currentMonth - i, 1);
		const year = date.getFullYear();
		const monthIndex = date.getMonth();
		const value = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
		const label = date.toLocaleString("en-US", {
			month: "long",
			year: "numeric",
		});

		options.push({ label, value, year, monthIndex });
	}

	return options;
}

export default function MonthlyExportDialog({
	open,
	onClose,
}: MonthlyExportDialogProps) {
	const monthOptions = getMonthOptions();
	const defaultMonth = monthOptions[0]?.value ?? "";

	const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);
	const [loading, setLoading] = useState(false);
	const [progressStatus, setProgressStatus] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	const handleClose = () => {
		if (loading) {
			return;
		}
		setErrorMessage("");
		setProgressStatus("");
		onClose();
	};

	const handleExport = async () => {
		if (!selectedMonth || loading) {
			return;
		}

		const option = monthOptions.find((opt) => opt.value === selectedMonth);
		if (!option) {
			return;
		}

		setLoading(true);
		setErrorMessage("");
		setProgressStatus("Fetching bills...");

		try {
			const startOfMonth = new Date(option.year, option.monthIndex, 1, 0, 0, 0, 0);
			const startOfNextMonth = new Date(
				option.year,
				option.monthIndex + 1,
				1,
				0,
				0,
				0,
				0,
			);
			const fromISO = startOfMonth.toISOString();
			const toISO = startOfNextMonth.toISOString();

			const invoicesWithItems = await getInvoicesForMonth(fromISO, toISO);

			if (invoicesWithItems.length === 0) {
				setErrorMessage("No bills were generated for the selected month.");
				setLoading(false);
				setProgressStatus("");
				return;
			}

			const zip = new JSZip();

			for (let i = 0; i < invoicesWithItems.length; i++) {
				const invoiceData = invoicesWithItems[i];
				setProgressStatus(
					`Generating PDF ${i + 1} of ${invoicesWithItems.length}...`,
				);

				const pdfPreviewData = formatInvoiceForPdf(invoiceData);
				const pdfBytes = await createInvoicePdf(pdfPreviewData);

				const safeFileName = `${invoiceData.invoice.invoice_number.replace(
					/[/\\?%*:|"<>]/g,
					"-",
				)}.pdf`;

				zip.file(safeFileName, pdfBytes);
			}

			setProgressStatus("Creating ZIP file...");

			const zipBlob = await zip.generateAsync({ type: "blob" });
			const monthName = startOfMonth.toLocaleString("en-US", {
				month: "long",
			});
			const zipFileName = `JS-Bills-${monthName}-${option.year}.zip`;

			const downloadUrl = URL.createObjectURL(zipBlob);
			const link = document.createElement("a");
			link.href = downloadUrl;
			link.download = zipFileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(downloadUrl);

			setLoading(false);
			setProgressStatus("");
			onClose();
		} catch (error) {
			console.error("Failed to export monthly bills:", error);
			setErrorMessage("Failed to export monthly bills. Please try again.");
			setLoading(false);
			setProgressStatus("");
		}
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			fullWidth
			maxWidth='xs'
			sx={{
				"& .MuiDialog-paper": {
					m: { xs: 2, sm: 3 },
				},
			}}
		>
			<DialogTitle>Download Monthly Bills</DialogTitle>
			<DialogContent>
				<Stack spacing={2.5} sx={{ pt: 1 }}>
					<Typography variant='body2' color='text.secondary'>
						Select a month to download all generated bills as a ZIP archive.
					</Typography>

					<FormControl fullWidth size='small'>
						<InputLabel id='monthly-export-month-label'>Month</InputLabel>
						<Select
							labelId='monthly-export-month-label'
							label='Month'
							value={selectedMonth}
							onChange={(event) => {
								setSelectedMonth(event.target.value);
								setErrorMessage("");
							}}
							disabled={loading}
						>
							{monthOptions.map((opt) => (
								<MenuItem key={opt.value} value={opt.value}>
									{opt.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					{progressStatus && (
						<Stack
							direction='row'
							spacing={1.5}
							sx={{ alignItems: "center", py: 0.5 }}
						>
							<CircularProgress size={18} />
							<Typography variant='body2' color='text.secondary'>
								{progressStatus}
							</Typography>
						</Stack>
					)}

					{errorMessage && (
						<Alert
							severity={
								errorMessage.includes("No bills") ? "info" : "error"
							}
						>
							{errorMessage}
						</Alert>
					)}
				</Stack>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2.5 }}>
				<Button onClick={handleClose} disabled={loading}>
					Cancel
				</Button>
				<Button
					onClick={handleExport}
					variant='contained'
					disabled={loading || !selectedMonth}
					startIcon={
						loading ? (
							<CircularProgress size={16} color='inherit' />
						) : (
							<FileDownloadOutlined />
						)
					}
				>
					{loading ? "Exporting..." : "Download"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

