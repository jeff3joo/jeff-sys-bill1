export type BillItem = {
	productId: string;
	name: string;
	type: "product" | "service";
	category: string;
	mrp: number;
	quantity: number;
	sellingPrice: string;
};

export type InvoicePayload = {
	customerName: string;
	customerPhone: string;
	customerEmail: string;
	customerAddress: string;
	subtotal: number;
	discount: number;
	total: number;
	items: BillItem[];
};

export type CreateInvoiceInput = {
	customerName: string;
	customerPhone: string;
	customerEmail: string;
	customerAddress: string;
	subtotal: number;
	discountTotal: number;
	taxTotal: number;
	grandTotal: number;
};

export type InvoiceItemPayload = {
	invoiceId: string;
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