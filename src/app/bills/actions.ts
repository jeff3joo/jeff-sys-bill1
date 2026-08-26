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
}
