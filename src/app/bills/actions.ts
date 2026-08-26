"use server";

import { createClient } from "@/lib/supabase/server";
import type { PaymentStatus } from "@/types/billing";

type PaymentUpdate = {
	paymentStatus: PaymentStatus;
	amountReceived: number;
	amountPending: number;
};

export async function updatePaymentStatus(
	invoiceId: string,
	update: PaymentUpdate,
) {
	if (
		!invoiceId ||
		!Number.isFinite(update.amountReceived) ||
		!Number.isFinite(update.amountPending) ||
		update.amountReceived < 0 ||
		update.amountPending < 0
	) {
		throw new Error("Invalid payment update.");
	}

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

	const { error } = await supabase
		.from("invoices")
		.update({
			payment_status: update.paymentStatus,
			amount_received: update.amountReceived,
			amount_pending: update.amountPending,
		})
		.eq("id", invoiceId);

	if (error) {
		throw new Error(error.message);
	}

	const delta = Math.round((update.amountReceived - oldAmountReceived) * 100) / 100;

	if (delta > 0) {
		const { error: txError } = await supabase
			.from("payment_transactions")
			.insert({
				invoice_id: invoiceId,
				amount: delta,
			});

		if (txError) {
			console.error(
				"Failed to record payment transaction on status update:",
				txError,
			);
			throw new Error(txError.message);
		}
	}
}
