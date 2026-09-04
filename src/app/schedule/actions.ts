"use server";

import { createClient } from "@/lib/supabase/server";
import type { AppointmentFormData } from "@/types/schedule";

export async function createAppointment(data: AppointmentFormData): Promise<void> {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	const { error } = await supabase.from("appointments").insert({
		user_id: user.id,
		customer_name: data.customer_name.trim(),
		visit_date: data.visit_date,
		visit_time: data.visit_time,
		location: data.location.trim(),
		notes: data.notes.trim(),
		status: data.status,
	});

	if (error) {
		throw new Error(error.message);
	}
}

export async function updateAppointment(
	id: string,
	data: AppointmentFormData,
): Promise<void> {
	const supabase = await createClient();

	const { error } = await supabase
		.from("appointments")
		.update({
			customer_name: data.customer_name.trim(),
			visit_date: data.visit_date,
			visit_time: data.visit_time,
			location: data.location.trim(),
			notes: data.notes.trim(),
			status: data.status,
			updated_at: new Date().toISOString(),
		})
		.eq("id", id);

	if (error) {
		throw new Error(error.message);
	}
}

export async function deleteAppointment(id: string): Promise<void> {
	const supabase = await createClient();

	const { error } = await supabase
		.from("appointments")
		.delete()
		.eq("id", id);

	if (error) {
		throw new Error(error.message);
	}
}

export async function markAppointmentComplete(id: string): Promise<void> {
	const supabase = await createClient();

	const { error } = await supabase
		.from("appointments")
		.update({
			status: "completed",
			updated_at: new Date().toISOString(),
		})
		.eq("id", id);

	if (error) {
		throw new Error(error.message);
	}
}
