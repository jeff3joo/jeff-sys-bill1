import type { BillItem } from "@/types/billing";

export function getSellingPrice(item: BillItem) {
	return roundMoney(Number(item.sellingPrice || 0));
}

export function getDiscountPerUnit(item: BillItem) {
	if (item.mrp <= 0) {
		return 0;
	}

	const sellingPrice = getSellingPrice(item);

	return roundMoney(Math.max(item.mrp - sellingPrice, 0));
}

export function getDiscountAmount(item: BillItem) {
	return roundMoney(getDiscountPerUnit(item) * item.quantity);
}

export function getDiscountPercentage(item: BillItem) {
	if (item.mrp <= 0) {
		return 0;
	}

	return roundMoney((getDiscountPerUnit(item) / item.mrp) * 100);
}

export function getLineTotal(item: BillItem) {
	return roundMoney(getSellingPrice(item) * item.quantity);
}

export function getSubtotal(items: BillItem[]) {
	return roundMoney(
		items.reduce((total, item) => {
			if (item.mrp > 0) {
				return total + item.mrp * item.quantity;
			}

			return total + getSellingPrice(item) * item.quantity;
		}, 0)
	);
}

export function getTotalDiscount(items: BillItem[]) {
	return roundMoney(
		items.reduce((total, item) => total + getDiscountAmount(item), 0),
	);
}

export function getGrandTotal(items: BillItem[]) {
	const subtotal = getSubtotal(items);
	const discount = getTotalDiscount(items);

	return roundMoney(subtotal - discount);
}

export function roundMoney(value: number) {
	return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function isSellingPriceValid(item: BillItem) {
	const sellingPrice = getSellingPrice(item);

	return sellingPrice <= item.mrp;
}

export function hasMrp(item: BillItem) {
	return item.mrp > 0;
}