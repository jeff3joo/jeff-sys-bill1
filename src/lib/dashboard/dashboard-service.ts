import { createClient } from "@/lib/supabase/client";

export interface DashboardMetrics {
	totalBills: number;
	pendingCollection: number;
	thisWeekCollection: number;
	thisMonthCollection: number;
	thisYearCollection: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
	const supabase = createClient();
	const now = new Date();

	// Calendar boundaries based on local date
	// 1. Start of Week (Monday 00:00:00)
	const daysSinceMonday = (now.getDay() + 6) % 7;
	const startOfWeek = new Date(now);
	startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday);
	startOfWeek.setHours(0, 0, 0, 0);

	// 2. Start of Month (1st of month 00:00:00)
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

	// 3. Start of Year (Jan 1st 00:00:00)
	const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);

	// Query invoices and transactions in parallel
	const [totalBillsResult, pendingResult, transactionsResult] =
		await Promise.all([
			// 1. Total Bills Generated: count all invoices
			supabase.from("invoices").select("id", { count: "exact", head: true }),

			// 2. Pending Collection: sum of amount_pending for not_paid and partially_paid
			supabase
				.from("invoices")
				.select("amount_pending")
				.in("payment_status", ["not_paid", "partially_paid"]),

			// 3. Transactions from start of year onwards
			supabase
				.from("payment_transactions")
				.select("amount, created_at")
				.gte("created_at", startOfYear.toISOString()),
		]);

	if (totalBillsResult.error) {
		console.error("Failed to fetch total bills count:", totalBillsResult.error);
	}
	if (pendingResult.error) {
		console.error("Failed to fetch pending invoices:", pendingResult.error);
	}
	if (transactionsResult.error) {
		console.error(
			"Failed to fetch payment transactions:",
			transactionsResult.error,
		);
	}

	const totalBills = totalBillsResult.count ?? 0;

	const pendingCollection = (pendingResult.data ?? []).reduce(
		(sum, row) => sum + Number(row.amount_pending || 0),
		0,
	);

	const transactions = transactionsResult.data ?? [];
	let thisWeekCollection = 0;
	let thisMonthCollection = 0;
	let thisYearCollection = 0;

	const weekTimestamp = startOfWeek.getTime();
	const monthTimestamp = startOfMonth.getTime();

	for (const tx of transactions) {
		const amount = Number(tx.amount || 0);
		if (!Number.isFinite(amount) || amount <= 0) {
			continue;
		}

		thisYearCollection += amount;

		const txTime = new Date(tx.created_at).getTime();
		if (txTime >= monthTimestamp) {
			thisMonthCollection += amount;
		}
		if (txTime >= weekTimestamp) {
			thisWeekCollection += amount;
		}
	}

	return {
		totalBills,
		pendingCollection,
		thisWeekCollection,
		thisMonthCollection,
		thisYearCollection,
	};
}

