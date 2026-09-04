import { createClient } from "@/lib/supabase/client";
import type { Appointment } from "@/types/schedule";

export async function getAppointments(): Promise<Appointment[]> {
	const supabase = createClient();
	const { data, error } = await supabase
		.from("appointments")
		.select("*")
		.order("visit_date", { ascending: true })
		.order("visit_time", { ascending: true });

	if (error) {
		console.error("Failed to fetch appointments:", error);
		return [];
	}

	return data ?? [];
}

export async function getTodayAppointments(): Promise<Appointment[]> {
	const supabase = createClient();
	const today = new Date().toISOString().split("T")[0];

	const { data, error } = await supabase
		.from("appointments")
		.select("*")
		.eq("visit_date", today)
		.in("status", ["scheduled"])
		.order("visit_time", { ascending: true });

	if (error) {
		console.error("Failed to fetch today appointments:", error);
		return [];
	}

	return data ?? [];
}
