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
		p_payment_status: input.paymentStatus,
		p_amount_received: input.amountReceived,
		p_amount_pending: input.amountPending,
		p_items: items,
		p_invoice_id: input.invoiceId ?? null,
		p_document_type: input.documentType ?? "bill",
	});

	if (error) {
		throw new Error(error.message);
	}

	const newInvoice = data[0];
	const initialReceived = Math.round(input.amountReceived * 100) / 100;

	if (
		input.documentType !== "quotation" &&
		newInvoice?.id &&
		initialReceived > 0 &&
		input.paymentStatus !== "not_paid"
	) {
		const { error: txError } = await supabase
			.from("payment_transactions")
			.insert({
				invoice_id: newInvoice.id,
				amount: initialReceived,
			});

		if (txError) {
			console.error("Failed to record payment transaction on create:", txError);
			throw new Error(txError.message);
		}
	}

	return newInvoice;
}

export async function updateInvoiceWithItems(
	invoiceId: string,
	input: CreateInvoiceInput,
	items: InvoiceItemInput[],
) {
	const supabase = await createClient();

	const { data: currentInvoice, error: fetchError } = await supabase
		.from("invoices")
		.select("amount_received")
		.eq("id", invoiceId)
		.single();

	if (fetchError) {
		throw new Error(fetchError.message);
	}

	const oldAmountReceived = Number(currentInvoice?.amount_received ?? 0);

	const { data, error } = await supabase.rpc("create_invoice_with_items", {
		p_customer_name: input.customerName,
		p_customer_phone: input.customerPhone,
		p_customer_email: input.customerEmail,
		p_customer_address: input.customerAddress,
		p_subtotal: input.subtotal,
		p_discount_total: input.discountTotal,
		p_tax_total: input.taxTotal,
		p_grand_total: input.grandTotal,
		p_payment_status: input.paymentStatus,
		p_amount_received: input.amountReceived,
		p_amount_pending: input.amountPending,
		p_items: items,
		p_invoice_id: invoiceId,
		p_document_type: input.documentType ?? "bill",
	});

	if (error) {
		throw new Error(error.message);
	}

	const updatedInvoice = data[0];
	const delta = Math.round((input.amountReceived - oldAmountReceived) * 100) / 100;

	if (input.documentType !== "quotation" && delta > 0) {
		const { error: txError } = await supabase
			.from("payment_transactions")
			.insert({
				invoice_id: invoiceId,
				amount: delta,
			});

		if (txError) {
			console.error("Failed to record payment transaction on edit:", txError);
			throw new Error(txError.message);
		}
	}

	return updatedInvoice;
}

export async function deleteInvoice(invoiceId: string) {
	const supabase = await createClient();

	const { error } = await supabase.rpc("delete_invoice", {
		p_invoice_id: invoiceId,
	});

	if (error) {
		console.error("[deleteInvoice] Error deleting document:", error);
		throw new Error(error.message);
	}
}
