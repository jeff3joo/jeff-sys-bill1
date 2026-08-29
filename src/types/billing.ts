export type PaymentStatus = "not_paid" | "partially_paid" | "fully_paid";
export type DocumentType = "bill" | "quotation";

export type BillItem = {
	lineItemId: string;
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
	paymentStatus: PaymentStatus;
	amountReceived: number;
	amountPending: number;
	items: BillItem[];
	documentType?: DocumentType;
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
	paymentStatus: PaymentStatus;
	amountReceived: number;
	amountPending: number;
	invoiceId?: string | null;
	documentType?: DocumentType;
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

export type InvoicePreviewData = {
	invoiceNumber: string;
	createdAt: string;

	customerName: string;
	customerPhone: string;
	customerEmail: string;
	customerAddress: string;

	subtotal: number;
	discountTotal: number;
	taxTotal: number;
	grandTotal: number;
	paymentStatus: PaymentStatus;
	amountReceived: number;
	amountPending: number;
	documentType?: DocumentType;

	items: {
		lineItemId: string;
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
		tax: number;
	}[];
};

export type PaymentTransaction = {
	id: string;
	invoiceId: string;
	amount: number;
	createdAt: string;
};

