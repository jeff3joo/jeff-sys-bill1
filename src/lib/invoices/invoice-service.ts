import { createClient } from "@/lib/supabase/client";
import { getDiscountAmount, getTaxAmount } from "@/lib/calculations/billing";
import type {
	BillItem,
	DocumentType,
	InvoicePreviewData,
	PaymentStatus,
} from "@/types/billing";

export interface InvoiceSummary {
	id: string;
	invoice_number: string;
	customer_name: string;
	created_at: string;
	grand_total: number;
	payment_status: PaymentStatus;
	amount_received: number;
	amount_pending: number;
	document_type?: DocumentType;
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
	document_type?: DocumentType;
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
	documentType: DocumentType = "bill",
): Promise<PaginatedInvoices> {
	const supabase = createClient();
	const from = (page - 1) * pageSize;
	const to = from + pageSize - 1;
	const search = searchQuery.trim();

	let query = supabase
		.from("invoices")
		.select(
			"id, invoice_number, customer_name, created_at, grand_total, payment_status, amount_received, amount_pending, document_type",
			{ count: "exact" },
		);

	if (documentType === "quotation") {
		query = query.or("document_type.eq.quotation,invoice_number.ilike.QT-%");
	} else {
		query = query.or(
			"document_type.eq.bill,document_type.is.null,invoice_number.ilike.JS-%",
		);
	}

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

	if (documentType !== "quotation" && paymentStatuses && paymentStatuses.length > 0) {
		query = query.in("payment_status", paymentStatuses);
	}

	const { data, error, count } = await query
		.order("created_at", { ascending: false })
		.range(from, to);

	if (error) {
		throw error;
	}

	return {
		invoices: (data ?? []).map((row) => ({
			...row,
			document_type:
				(row.document_type as DocumentType) ||
				(row.invoice_number?.startsWith("QT-") ? "quotation" : "bill"),
		})) as InvoiceSummary[],
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
			"id, invoice_number, customer_name, customer_phone, customer_email, customer_address, created_at, subtotal, discount_total, tax_total, grand_total, payment_status, amount_received, amount_pending, document_type",
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

	const docType: DocumentType =
		(invoice?.document_type as DocumentType) ||
		(invoice?.invoice_number?.startsWith("QT-") ? "quotation" : "bill");

	const invoiceWithDocType: InvoiceDetails = {
		...(invoice as InvoiceDetails),
		document_type: docType,
	};

	return {
		invoice: invoiceWithDocType,
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

export function formatInvoiceForPdf(
	invoiceWithItems: InvoiceWithItems,
): InvoicePreviewData {
	const { invoice, items } = invoiceWithItems;
	const pdfItems = items.map((item) => ({
		lineItemId: item.id,
		productId: item.product_id,
		name: item.name,
		type: item.type,
		category: item.category,
		quantity: item.quantity,
		mrp: item.mrp,
		sellingPrice: item.selling_price,
		discount: getDiscountAmount({
			lineItemId: item.product_id,
			productId: item.product_id,
			name: item.name,
			type: item.type,
			category: item.category,
			mrp: item.mrp,
			quantity: item.quantity,
			sellingPrice: String(item.selling_price),
		}),
		discountPercentage: item.discount_percentage,
		lineTotal: item.line_total,
		tax: item.tax,
	}));

	const docType: DocumentType =
		invoice.document_type ||
		(invoice.invoice_number?.startsWith("QT-") ? "quotation" : "bill");

	return {
		invoiceNumber: invoice.invoice_number,
		createdAt: invoice.created_at,
		customerName: invoice.customer_name,
		customerPhone: invoice.customer_phone,
		customerEmail: invoice.customer_email,
		customerAddress: invoice.customer_address,
		subtotal: invoice.subtotal,
		discountTotal: invoice.discount_total,
		taxTotal: invoice.tax_total,
		grandTotal: invoice.grand_total,
		paymentStatus: invoice.payment_status,
		amountReceived: invoice.amount_received,
		amountPending: invoice.amount_pending,
		documentType: docType,
		items: pdfItems,
	};
}

export async function getInvoicesForMonth(
	fromISO: string,
	toISO: string,
	documentType: DocumentType = "bill",
): Promise<InvoiceWithItems[]> {
	const supabase = createClient();
	let query = supabase
		.from("invoices")
		.select(
			"id, invoice_number, customer_name, customer_phone, customer_email, customer_address, created_at, subtotal, discount_total, tax_total, grand_total, payment_status, amount_received, amount_pending, document_type",
		)
		.gte("created_at", fromISO)
		.lt("created_at", toISO);

	if (documentType === "quotation") {
		query = query.or("document_type.eq.quotation,invoice_number.ilike.QT-%");
	} else {
		query = query.or(
			"document_type.eq.bill,document_type.is.null,invoice_number.ilike.JS-%",
		);
	}

	const { data: invoices, error: invoiceError } = await query.order(
		"created_at",
		{ ascending: true },
	);

	if (invoiceError) {
		throw invoiceError;
	}

	if (!invoices || invoices.length === 0) {
		return [];
	}

	const invoiceIds = invoices.map((inv) => inv.id);

	const { data: items, error: itemsError } = await supabase
		.from("invoice_items")
		.select(
			"id, invoice_id, product_id, item_name, item_type, category, mrp, selling_price, quantity, discount_percentage, line_total",
		)
		.in("invoice_id", invoiceIds);

	if (itemsError) {
		throw itemsError;
	}

	const itemsByInvoiceId = new Map<string, typeof items>();
	for (const item of items ?? []) {
		const list = itemsByInvoiceId.get(item.invoice_id) ?? [];
		list.push(item);
		itemsByInvoiceId.set(item.invoice_id, list);
	}

	return invoices.map((invoice) => {
		const invoiceItems = itemsByInvoiceId.get(invoice.id) ?? [];
		return {
			invoice: invoice as InvoiceDetails,
			items: invoiceItems.map((item) => {
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
	});
}
