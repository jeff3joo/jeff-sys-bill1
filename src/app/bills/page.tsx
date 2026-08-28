"use client";

import {
	Alert,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Stack,
	Typography,
} from "@mui/material";
import { AddOutlined, FileDownloadOutlined } from "@mui/icons-material";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import BillList from "@/components/bills/bill-list";
import type { Bill } from "@/components/bills/bill-item";
import BillPagination from "@/components/bills/bill-pagination";
import BillToolbar, {
	type BillDateFilter,
} from "@/components/bills/bill-toolbar";
import MonthlyExportDialog from "@/components/bills/monthly-export-dialog";
import {
	formatInvoiceForPdf,
	getInvoicesPaginated,
	getInvoiceWithItems,
	type InvoiceDateRange,
} from "@/lib/invoices/invoice-service";
import { createInvoicePdf } from "@/lib/pdf/invoice";
import type { PaymentStatus } from "@/types/billing";
import { deleteInvoice } from "@/app/billing/actions";

const PAGE_SIZE = 10;
const VALID_PAYMENT_STATUSES: PaymentStatus[] = [
	"not_paid",
	"partially_paid",
	"fully_paid",
];

function parseStatusParams(statusParam: string | null): PaymentStatus[] {
	if (!statusParam) {
		return [];
	}

	return statusParam
		.split(",")
		.map((s) => s.trim())
		.filter((s): s is PaymentStatus =>
			VALID_PAYMENT_STATUSES.includes(s as PaymentStatus),
		);
}

function BillsContent() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const currentStatusParam = searchParams.get("status");
	const [prevStatusParam, setPrevStatusParam] = useState(currentStatusParam);
	const [searchQuery, setSearchQuery] = useState("");
	const [dateFilter, setDateFilter] = useState<BillDateFilter>("all");
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");
	const [paymentStatuses, setPaymentStatuses] = useState<PaymentStatus[]>(() =>
		parseStatusParams(currentStatusParam),
	);
	const [bills, setBills] = useState<Bill[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [page, setPage] = useState(1);
	const [downloadingBillId, setDownloadingBillId] = useState<string | null>(
		null,
	);
	const [actionError, setActionError] = useState("");
	const [deletingBill, setDeletingBill] = useState<Bill | null>(null);
	const [deleteError, setDeleteError] = useState("");
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [monthlyExportOpen, setMonthlyExportOpen] = useState(false);
	const billsRequestRef = useRef(0);

	if (currentStatusParam !== prevStatusParam) {
		setPrevStatusParam(currentStatusParam);
		setPaymentStatuses(parseStatusParams(currentStatusParam));
		setPage(1);
	}

	const getLocalDayStart = (date: Date) => {
		const start = new Date(date);
		start.setHours(0, 0, 0, 0);
		return start;
	};

	const getLocalDayEnd = (date: Date) => {
		const end = new Date(date);
		end.setHours(23, 59, 59, 999);
		return end;
	};

	const getDateRange = useCallback((): InvoiceDateRange | undefined => {
		if (dateFilter === "today") {
			const today = new Date();
			return {
				from: getLocalDayStart(today).toISOString(),
				to: getLocalDayEnd(today).toISOString(),
			};
		}

		if (dateFilter === "week") {
			const now = new Date();
			const startOfWeek = new Date(now);
			const day = startOfWeek.getDay();
			const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
			startOfWeek.setDate(diff);

			return {
				from: getLocalDayStart(startOfWeek).toISOString(),
				to: getLocalDayEnd(now).toISOString(),
			};
		}

		if (dateFilter === "month") {
			const now = new Date();
			const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

			return {
				from: getLocalDayStart(startOfMonth).toISOString(),
				to: getLocalDayEnd(now).toISOString(),
			};
		}

		if (dateFilter === "custom") {
			const range: InvoiceDateRange = {};
			if (fromDate) {
				const parsedFromDate = new Date(`${fromDate}T00:00:00`);
				range.from = getLocalDayStart(parsedFromDate).toISOString();
			}

			if (toDate) {
				const parsedToDate = new Date(`${toDate}T00:00:00`);
				range.to = getLocalDayEnd(parsedToDate).toISOString();
			}

			return range.from || range.to ? range : undefined;
		}

		return undefined;
	}, [dateFilter, fromDate, toDate]);

	const loadBills = useCallback(
		async (requestedPage: number) => {
			const requestId = ++billsRequestRef.current;
			setLoading(true);
			setError(false);

			try {
				const result = await getInvoicesPaginated(
					requestedPage,
					PAGE_SIZE,
					searchQuery,
					getDateRange(),
					paymentStatuses,
				);

				if (billsRequestRef.current !== requestId) {
					return;
				}

				const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
				setTotal(result.total);

				if (requestedPage > totalPages) {
					setBills([]);
					setPage(totalPages);
					return;
				}

				setBills(
					result.invoices.map((invoice) => ({
						id: invoice.id,
						invoiceNumber: invoice.invoice_number,
						customerName: invoice.customer_name,
						invoiceDate: new Date(invoice.created_at).toLocaleDateString(
							"en-IN",
							{
								day: "numeric",
								month: "short",
								year: "numeric",
							},
						),
						grandTotal: invoice.grand_total,
						paymentStatus: invoice.payment_status,
						amountReceived: invoice.amount_received,
						amountPending: invoice.amount_pending,
					})),
				);
			} catch (fetchError) {
				if (billsRequestRef.current !== requestId) {
					return;
				}

				console.error("Failed to load invoices:", fetchError);
				setError(true);
			} finally {
				if (billsRequestRef.current === requestId) {
					setLoading(false);
				}
			}
		},
		[getDateRange, paymentStatuses, searchQuery],
	);

	useEffect(() => {
		void Promise.resolve().then(() => loadBills(page));
	}, [loadBills, page]);

	const totalPages = Math.ceil(total / PAGE_SIZE);

	const handleEdit = (bill: Bill) => {
		router.push(`/billing?invoiceId=${encodeURIComponent(bill.id)}`);
	};

	const handleDownloadPdf = async (bill: Bill) => {
		if (downloadingBillId) {
		}

		setDownloadingBillId(bill.id);
		setActionError("");

		try {
			const invoiceWithItems = await getInvoiceWithItems(bill.id);
			const pdfData = formatInvoiceForPdf(invoiceWithItems);
			const pdfBytes = await createInvoicePdf(pdfData);
			const blob = new Blob([new Uint8Array(pdfBytes)], {
				type: "application/pdf",
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${invoiceWithItems.invoice.invoice_number}.pdf`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			setTimeout(() => URL.revokeObjectURL(url), 1000);
		} catch (downloadError) {
			console.error("Failed to download invoice PDF:", downloadError);
			setActionError("Unable to download this bill. Please try again.");
		} finally {
			setDownloadingBillId(null);
		}
	};

	const handleDelete = async () => {
		if (!deletingBill || deleteLoading) {
			return;
		}

		setDeleteLoading(true);
		setDeleteError("");

		try {
			await deleteInvoice(deletingBill.id);
			setDeletingBill(null);

			if (bills.length === 1 && page > 1) {
				setPage(page - 1);
			} else {
				await loadBills(page);
			}
		} catch (deleteActionError) {
			console.error("Failed to delete invoice:", deleteActionError);
			setDeleteError("Unable to delete this bill. Please try again.");
		} finally {
			setDeleteLoading(false);
		}
	};

	return (
		<AppShell>
			<MonthlyExportDialog
				open={monthlyExportOpen}
				onClose={() => setMonthlyExportOpen(false)}
			/>
			<Stack spacing={{ xs: 2.5, sm: 4 }}>
				{actionError && <Alert severity='error'>{actionError}</Alert>}
				<Box
					sx={{
						display: "flex",
						alignItems: { xs: "flex-start", sm: "center" },
						justifyContent: "space-between",
						gap: 2,
						flexDirection: { xs: "column", sm: "row" },
					}}
				>
					<Box>
						<Typography
							variant='h4'
							sx={{
								fontSize: { xs: "1.5rem", sm: "2.125rem" },
								fontWeight: 700,
							}}
						>
							Bills
						</Typography>
						<Typography color='text.secondary' sx={{ mt: { xs: 0.5, sm: 1 } }}>
							View and manage your generated bills.
						</Typography>
					</Box>
					<Stack
						direction={{ xs: "column", sm: "row" }}
						spacing={1.5}
						sx={{ width: { xs: "100%", sm: "auto" } }}
					>
						<Button
							variant='outlined'
							startIcon={<FileDownloadOutlined />}
							onClick={() => setMonthlyExportOpen(true)}
							sx={{ width: { xs: "100%", sm: "auto" } }}
						>
							Download Monthly Bills
						</Button>
						<Button
							variant='contained'
							startIcon={<AddOutlined />}
							href='/billing'
							sx={{ width: { xs: "100%", sm: "auto" } }}
						>
							Create Bill
						</Button>
					</Stack>
				</Box>

				<BillToolbar
					searchQuery={searchQuery}
					dateFilter={dateFilter}
					fromDate={fromDate}
					toDate={toDate}
					paymentStatuses={paymentStatuses}
					onSearchQueryChange={(value) => {
						setSearchQuery(value);
						setPage(1);
					}}
					onDateFilterChange={(value) => {
						setDateFilter(value);
						setPage(1);
					}}
					onFromDateChange={(value) => {
						setFromDate(value);
						if (toDate && value > toDate) setToDate(value);
						setPage(1);
					}}
					onToDateChange={(value) => {
						setToDate(fromDate && value < fromDate ? fromDate : value);
						setPage(1);
					}}
					onPaymentStatusesChange={(statuses) => {
						setPaymentStatuses(statuses);
						setPage(1);
					}}
				/>
				<BillList
					loading={loading}
					error={error}
					bills={bills}
					hasFilters={
						Boolean(searchQuery.trim()) ||
						dateFilter !== "all" ||
						paymentStatuses.length > 0
					}
					downloadingBillId={downloadingBillId}
					deletingBillId={deletingBill?.id ?? null}
					onRetry={() => void loadBills(page)}
					onEdit={handleEdit}
					onDownloadPdf={handleDownloadPdf}
					onDelete={(bill) => {
						setDeleteError("");
						setDeletingBill(bill);
					}}
					onPaymentUpdated={() => void loadBills(page)}
				/>
				<BillPagination
					page={page}
					totalPages={totalPages}
					onPageChange={setPage}
				/>
			</Stack>
			<Dialog
				open={deletingBill !== null}
				onClose={() => {
					if (!deleteLoading) {
						setDeletingBill(null);
						setDeleteError("");
					}
				}}
				fullWidth
				maxWidth='xs'
				sx={{
					"& .MuiDialog-paper": {
						m: { xs: 2, sm: 3 },
					},
				}}
			>
				<DialogTitle>Delete {deletingBill?.invoiceNumber}?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						This bill and its invoice items will be permanently deleted.
					</DialogContentText>
					{deleteError && (
						<Typography color='error' sx={{ mt: 2 }}>
							{deleteError}
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setDeletingBill(null)}
						disabled={deleteLoading}
					>
						Cancel
					</Button>
					<Button
						onClick={() => void handleDelete()}
						color='error'
						variant='contained'
						disabled={deleteLoading}
					>
						{deleteLoading ? "Deleting..." : "Delete"}
					</Button>
				</DialogActions>
			</Dialog>
		</AppShell>
	);
}

export default function BillsPage() {
	return (
		<Suspense fallback={null}>
			<BillsContent />
		</Suspense>
	);
}
