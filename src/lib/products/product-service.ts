import { createClient } from "@/lib/supabase/client";

export async function getProducts() {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("products")
		.select("*")
		.eq("is_active", true)
		.order("created_at", {
			ascending: false,
		});

	if (error) {
		throw error;
	}

	return data;
}

export async function getProductsPaginated(
	page: number = 1,
	pageSize: number = 10,
	searchQuery: string = "",
) {
	const supabase = createClient();

	const from = (page - 1) * pageSize;
	const to = from + pageSize - 1;

	let query = supabase
		.from("products")
		.select("*", { count: "exact" })
		.eq("is_active", true);

	const search = searchQuery.trim();

	if (search) {
		const escapedSearch = search.replace(/[%_,]/g, "\\$&");

		query = query.or(
			`name.ilike.%${escapedSearch}%,category.ilike.%${escapedSearch}%,type.ilike.%${escapedSearch}%`,
		);
	}

	const { data, error, count } = await query
		.order("created_at", {
			ascending: false,
		})
		.range(from, to);

	if (error) {
		throw error;
	}

	return {
		products: data ?? [],
		total: count ?? 0,
		page,
		pageSize,
	};
}
