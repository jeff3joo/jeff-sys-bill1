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

export async function getInvoicesPaginated(
	page: number,
	pageSize: number,
): Promise<PaginatedInvoices> {
	const supabase = createClient();
	const from = (page - 1) * pageSize;
	const to = from + pageSize - 1;

	const { data, error, count } = await supabase
		.from("invoices")
		.select(
			"id, invoice_number, customer_name, created_at, grand_total",
			{ count: "exact" },
		)
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