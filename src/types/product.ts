export type ProductType = "product" | "service";

export interface Product {
	id: string;
	name: string;
	type: ProductType;
	category: string;
	mrp: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}
