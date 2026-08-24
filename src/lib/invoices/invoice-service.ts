import { createClient } from "@/lib/supabase/client";

export interface InvoiceSummary {
	id: string;
	invoice_number: string;
	customer_name: string;
	created_at: string;
	grand_total: number;
}

interface PaginatedInvoices {
	invoices: InvoiceSummary[];
	total: number;
}

export interface InvoiceDateRange {
	from?: string;
	to?: string;
}

export async function getInvoicesPaginated(
	page: number,
	pageSize: number,
	searchQuery: string = "",
	dateRange?: InvoiceDateRange,
): Promise<PaginatedInvoices> {
	const supabase = createClient();
	const from = (page - 1) * pageSize;
	const to = from + pageSize - 1;
	const search = searchQuery.trim();

	let query = supabase
		.from("invoices")
		.select(
			"id, invoice_number, customer_name, created_at, grand_total",
			{ count: "exact" },
		);

	if (search) {
		const escapedSearch = search.replace(/[%_,]/g, "\\$&");

		query = query.or(
			`customer_name.ilike.%${escapedSearch}%,invoice_number.ilike.%${escapedSearch}%`,
		);
	}

	if (dateRange?.from) {
		query = query.gte("created_at", dateRange.from);
	}

	if (dateRange?.to) {
		query = query.lte("created_at", dateRange.to);
	}

	const { data, error, count } = await query
		.order("created_at", { ascending: false })
		.range(from, to);

	if (error) {
		throw error;
	}

	return {
		invoices: (data ?? []) as InvoiceSummary[],
		total: count ?? 0,
	};
}