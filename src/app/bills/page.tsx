"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import { AddOutlined } from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import BillList from "@/components/bills/bill-list";
import { type Bill } from "@/components/bills/bill-item";
import BillPagination from "@/components/bills/bill-pagination";
import BillToolbar, { type BillDateFilter } from "@/components/bills/bill-toolbar";
import { getInvoicesPaginated } from "@/lib/invoices/invoice-service";

const PAGE_SIZE = 10;

export default function BillsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [dateFilter, setDateFilter] = useState<BillDateFilter>("all");
	const [bills, setBills] = useState<Bill[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [page, setPage] = useState(1);

	const loadBills = useCallback(async (requestedPage: number) => {
		await Promise.resolve();
		setLoading(true);
		setError(false);

		try {
			const result = await getInvoicesPaginated(
				requestedPage,
				PAGE_SIZE,
				searchQuery,
			);
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
					invoiceDate: new Date(invoice.created_at).toLocaleDateString("en-IN", {
						day: "numeric",
						month: "short",
						year: "numeric",
					}),
					grandTotal: invoice.grand_total,
				})),
			);
		} catch (fetchError) {
			console.error("Failed to load invoices:", fetchError);
			setError(true);
		} finally {
			setLoading(false);
		}
	}, [searchQuery]);

	useEffect(() => {
		void Promise.resolve().then(() => loadBills(page));
	}, [loadBills, page]);

	const totalPages = Math.ceil(total / PAGE_SIZE);

	return (
		<AppShell>
			<Stack spacing={4}>
				<Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
					<Box>
						<Typography variant='h4' sx={{ fontWeight: 700 }}>Bills</Typography>
						<Typography color='text.secondary' sx={{ mt: 1 }}>View and manage your generated bills.</Typography>
					</Box>
					<Button variant='contained' startIcon={<AddOutlined />} href='/billing'>Create Bill</Button>
				</Box>

				<BillToolbar searchQuery={searchQuery} dateFilter={dateFilter} onSearchQueryChange={(value) => { setSearchQuery(value); setPage(1); }} onDateFilterChange={(value) => { setDateFilter(value); setPage(1); }} />
				<BillList loading={loading} error={error} bills={bills} hasFilters={Boolean(searchQuery.trim())} onRetry={() => void loadBills(page)} onEdit={() => undefined} onDownloadPdf={() => undefined} onDelete={() => undefined} />
				<BillPagination page={page} totalPages={totalPages} onPageChange={setPage} />
			</Stack>
		</AppShell>
	);
}