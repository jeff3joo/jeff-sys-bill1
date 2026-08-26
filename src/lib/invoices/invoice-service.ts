import { createClient } from "@/lib/supabase/client";
import { getTaxAmount } from "@/lib/calculations/billing";
import type { BillItem, PaymentStatus } from "@/types/billing";

export interface InvoiceSummary {
	id: string;
	invoice_number: string;
	customer_name: string;
	created_at: string;
	grand_total: number;
	payment_status: PaymentStatus;
	amount_received: number;
	amount_pending: number;
}

interface PaginatedInvoices {
	invoices: InvoiceSummary[];
	total: number;
}

export interface InvoiceDateRange {
	from?: string;
	to?: string;
}

export interface InvoiceDetails extends InvoiceSummary {
	customer_phone: string;
	customer_email: string;
	customer_address: string;
	subtotal: number;
	discount_total: number;
	tax_total: number;
	payment_status: "not_paid" | "partially_paid" | "fully_paid";
	amount_received: number;
	amount_pending: number;
}

export interface InvoiceItemDetails {
	id: string;
	product_id: string;
	name: string;
	type: "product" | "service";
	category: string;
	mrp: number;
	selling_price: number;
	quantity: number;
	discount_percentage: number;
	line_total: number;
	tax: number;
}

export interface InvoiceWithItems {
	invoice: InvoiceDetails;
	items: InvoiceItemDetails[];
}

export async function getInvoicesPaginated(
	page: number,
	pageSize: number,
	searchQuery: string = "",
	dateRange?: InvoiceDateRange,
	paymentStatuses?: PaymentStatus[],
): Promise<PaginatedInvoices> {
	const supabase = createClient();
	const from = (page - 1) * pageSize;
	const to = from + pageSize - 1;
	const search = searchQuery.trim();

	let query = supabase
		.from("invoices")
		.select(
			"id, invoice_number, customer_name, created_at, grand_total, payment_status, amount_received, amount_pending",
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

	if (paymentStatuses && paymentStatuses.length > 0) {
		query = query.in("payment_status", paymentStatuses);
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

export async function getInvoiceWithItems(
	invoiceId: string,
): Promise<InvoiceWithItems> {
	const supabase = createClient();
	const { data: invoice, error: invoiceError } = await supabase
		.from("invoices")
		.select(
			"id, invoice_number, customer_name, customer_phone, customer_email, customer_address, created_at, subtotal, discount_total, tax_total, grand_total, payment_status, amount_received, amount_pending",
		)
		.eq("id", invoiceId)
		.single();

	if (invoiceError) {
		throw invoiceError;
	}

	const { data: items, error: itemsError } = await supabase
		.from("invoice_items")
		.select(
			"id, product_id, item_name, item_type, category, mrp, selling_price, quantity, discount_percentage, line_total",
		)
		.eq("invoice_id", invoiceId);

	if (itemsError) {
		throw itemsError;
	}

	return {
		invoice: invoice as InvoiceDetails,
		items: (items ?? []).map((item) => {
			const billItem: BillItem = {
				lineItemId: item.id,
				productId: item.product_id,
				name: item.item_name,
				type: item.item_type,
				category: item.category,
				mrp: item.mrp,
				quantity: item.quantity,
				sellingPrice: String(item.selling_price),
			};

			return {
				id: item.id,
				product_id: item.product_id,
				name: item.item_name,
				type: item.item_type,
				category: item.category,
				mrp: item.mrp,
				selling_price: item.selling_price,
				quantity: item.quantity,
				discount_percentage: item.discount_percentage,
				line_total: item.line_total,
				tax: getTaxAmount(billItem),
			};
		}) as InvoiceItemDetails[],
	};
}
