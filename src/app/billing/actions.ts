"use server";

import { createClient } from "@/lib/supabase/server";
import type { CreateInvoiceInput } from "@/types/billing";

type InvoiceItemInput = {
	productId: string;
	name: string;
	type: "product" | "service";
	category: string;
	mrp: number;
	sellingPrice: number;
	quantity: number;
	discount: number;
	discountPercentage: number;
	lineTotal: number;
};

export async function createInvoiceWithItems(
	input: CreateInvoiceInput,
	items: InvoiceItemInput[],
) {
	const supabase = await createClient();

	const { data, error } = await supabase.rpc("create_invoice_with_items", {
		p_customer_name: input.customerName,
		p_customer_phone: input.customerPhone,
		p_customer_email: input.customerEmail,
		p_customer_address: input.customerAddress,
		p_subtotal: input.subtotal,
		p_discount_total: input.discountTotal,
		p_tax_total: input.taxTotal,
		p_grand_total: input.grandTotal,
		p_items: items,
		p_invoice_id: input.invoiceId ?? null,
	});

	if (error) {
		throw new Error(error.message);
	}

	return data[0];
}

export async function updateInvoiceWithItems(
	invoiceId: string,
	input: CreateInvoiceInput,
	items: InvoiceItemInput[],
) {
	const supabase = await createClient();
	const { data, error } = await supabase.rpc("create_invoice_with_items", {
		p_customer_name: input.customerName,
		p_customer_phone: input.customerPhone,
		p_customer_email: input.customerEmail,
		p_customer_address: input.customerAddress,
		p_subtotal: input.subtotal,
		p_discount_total: input.discountTotal,
		p_tax_total: input.taxTotal,
		p_grand_total: input.grandTotal,
		p_items: items,
		p_invoice_id: invoiceId,
	});

	if (error) {
		throw new Error(error.message);
	}

	return data[0];
}

export async function deleteInvoice(invoiceId: string) {
	const supabase = await createClient();
	const { error } = await supabase.rpc("delete_invoice", {
		p_invoice_id: invoiceId,
	});

	if (error) {
		throw new Error(error.message);
	}
}
