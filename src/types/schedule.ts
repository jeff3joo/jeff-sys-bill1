export type VisitStatus = "scheduled" | "completed" | "cancelled";

export interface Appointment {
	id: string;
	user_id: string;
	customer_name: string;
	visit_date: string; // ISO date string: "YYYY-MM-DD"
	visit_time: string; // "HH:MM"
	location: string;
	notes: string;
	status: VisitStatus;
	created_at: string;
	updated_at: string;
}

export interface AppointmentFormData {
	customer_name: string;
	visit_date: string;
	visit_time: string;
	location: string;
	notes: string;
	status: VisitStatus;
}
