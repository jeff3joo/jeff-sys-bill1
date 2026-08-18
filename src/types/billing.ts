export type BillItem = {
	productId: string;
	name: string;
	type: "product" | "service";
	category: string;
	mrp: number;
	quantity: number;
	sellingPrice: string;
};
