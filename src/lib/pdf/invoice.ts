import { ToWords } from "to-words";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const invoiceLayout = {
	customer: {
		name: {
			x: 55,
			y: 650,
		},
		phone: {
			x: 55,
			y: 635,
		},
	},

	invoice: {
		number: {
			x: 475,
			y: 650,
		},
		date: {
			x: 475,
			y: 635,
		},
	},

	items: {
		startY: 600,
		minRowHeight: 24,
		endY: 190,
		nameMaxWidth: 180,
		totalsHeight: 55,

		columns: {
			name: 55,
			qty: 273,
			amount: 315,
			tax: 395,
			discount: 440,
			total: 493,
		},
	},

	totals: {
		x: 400,
		startY: 150,
		rowHeight: 18,
	},

	fontSize: 9,
};

type InvoicePdfData = {
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

	items: {
		name: string;
		type: string;
		category: string;
		quantity: number;
		mrp: number;
		sellingPrice: number;
		discount: number;
		lineTotal: number;
		tax: number;
	}[];
};

const toWords = new ToWords({
	localeCode: "en-IN",
});

export async function createInvoicePdf(invoice: InvoicePdfData) {
	const response = await fetch("/templates/invoice-template.pdf");

	if (!response.ok) {
		throw new Error("Failed to load invoice template");
	}

	const templateBytes = await response.arrayBuffer();
	const templateDoc = await PDFDocument.load(templateBytes);
	const pdfDoc = await PDFDocument.load(templateBytes);
	const pages = pdfDoc.getPages();

	if (pages.length === 0) {
		throw new Error("Invoice template has no pages");
	}

	const firstPage = pages[0];

	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
	const { customer, invoice: invoiceLayoutData } = invoiceLayout;

	const wrapText = (text: string, maxWidth: number, fontSize: number) => {
		const words = text.split(/\s+/);
		const lines: string[] = [];
		let currentLine = "";

		for (const word of words) {
			const testLine = currentLine ? `${currentLine} ${word}` : word;
			const width = font.widthOfTextAtSize(testLine, fontSize);

			if (width <= maxWidth) {
				currentLine = testLine;
				continue;
			}
			if (currentLine) {
				lines.push(currentLine);
			}

			currentLine = word;
		}

		if (currentLine) {
			lines.push(currentLine);
		}
		return lines.length > 0 ? lines : [""];
	};

	firstPage.drawText(invoice.customerName, {
		x: customer.name.x,
		y: customer.name.y,
		size: invoiceLayout.fontSize,
		font: boldFont,
		color: rgb(0, 0, 0),
	});

	if (invoice.customerPhone) {
		firstPage.drawText(`Mobile: ${invoice.customerPhone}`, {
			x: customer.phone.x,
			y: customer.phone.y,
			size: invoiceLayout.fontSize,
			font,
			color: rgb(0, 0, 0),
		});
	}

	firstPage.drawText(`Invoice: ${invoice.invoiceNumber}`, {
		x: invoiceLayoutData.number.x,
		y: invoiceLayoutData.number.y,
		size: invoiceLayout.fontSize,
		font: boldFont,
		color: rgb(0, 0, 0),
	});

	firstPage.drawText(
		new Date(invoice.createdAt).toLocaleDateString("en-IN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		}),
		{
			x: invoiceLayoutData.date.x,
			y: invoiceLayoutData.date.y,
			size: invoiceLayout.fontSize,
			font,
			color: rgb(0, 0, 0),
		},
	);

	const getItemRowHeight = (item: InvoicePdfData["items"][number]) => {
		const lines = wrapText(item.name, invoiceLayout.items.nameMaxWidth, 8);
		return Math.max(invoiceLayout.items.minRowHeight, lines.length * 12 + 8);
	};

	const getPageItems = (startIndex: number, reserveTotalsSpace: boolean) => {
		const pageItems: {
			index: number;
			height: number;
		}[] = [];

		const availableHeight =
			invoiceLayout.items.startY -
			invoiceLayout.items.endY -
			(reserveTotalsSpace ? invoiceLayout.items.totalsHeight : 0);

		let usedHeight = 0;
		for (let i = startIndex; i < invoice.items.length; i++) {
			const height = getItemRowHeight(invoice.items[i]);

			if (pageItems.length > 0 && usedHeight + height > availableHeight) {
				break;
			}
			if (pageItems.length === 0 && height > availableHeight) {
				throw new Error("Invoice item is too large to fit on a page");
			}

			pageItems.push({
				index: i,
				height,
			});
			usedHeight += height;
		}

		return pageItems;
	};

	const drawItem = (
		page: ReturnType<PDFDocument["getPages"]>[number],
		item: InvoicePdfData["items"][number],
		y: number,
	) => {
		const fontSize = 8;

		const lines = wrapText(
			item.name,
			invoiceLayout.items.nameMaxWidth,
			fontSize,
		);

		lines.forEach((line, index) => {
			page.drawText(line, {
				x: invoiceLayout.items.columns.name,
				y: y - index * 12,
				size: fontSize,
				font,
				color: rgb(0, 0, 0),
			});
		});

		page.drawText(String(item.quantity), {
			x: invoiceLayout.items.columns.qty,
			y,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});

		// MRP is GST-inclusive.
		// Display taxable amount excluding 18% GST.
		const amountWithoutTax =
			item.mrp > 0
				? (item.mrp / 1.18) * item.quantity
				: item.sellingPrice * item.quantity;

		page.drawText(
			amountWithoutTax.toLocaleString("en-IN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}),
			{
				x: invoiceLayout.items.columns.amount,
				y,
				size: fontSize,
				font,
				color: rgb(0, 0, 0),
			},
		);

		page.drawText(
			item.tax.toLocaleString("en-IN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}),
			{
				x: invoiceLayout.items.columns.tax,
				y,
				size: fontSize,
				font,
				color: rgb(0, 0, 0),
			},
		);

		page.drawText(
			item.discount.toLocaleString("en-IN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}),
			{
				x: invoiceLayout.items.columns.discount,
				y,
				size: fontSize,
				font,
				color: rgb(0, 0, 0),
			},
		);

		page.drawText(
			item.lineTotal.toLocaleString("en-IN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}),
			{
				x: invoiceLayout.items.columns.total,
				y,
				size: fontSize,
				font,
				color: rgb(0, 0, 0),
			},
		);
	};

	const drawPageItems = (
		page: ReturnType<PDFDocument["getPages"]>[number],
		pageItems: {
			index: number;
			height: number;
		}[],
		startY: number,
	) => {
		let currentY = startY;

		for (const pageItem of pageItems) {
			const item = invoice.items[pageItem.index];
			drawItem(page, item, currentY);
			currentY -= pageItem.height;
		}
	};

	const drawTableHeader = (
		page: ReturnType<PDFDocument["getPages"]>[number],
	) => {
		const y = invoiceLayout.items.startY + 18;

		page.drawText("Item & Description", {
			x: invoiceLayout.items.columns.name,
			y,
			size: 8,
			font: boldFont,
			color: rgb(0, 0, 0),
		});

		page.drawText("Qty", {
			x: invoiceLayout.items.columns.qty,
			y,
			size: 8,
			font: boldFont,
			color: rgb(0, 0, 0),
		});

		page.drawText("Amount", {
			x: invoiceLayout.items.columns.amount,
			y,
			size: 8,
			font: boldFont,
			color: rgb(0, 0, 0),
		});

		page.drawText("Tax", {
			x: invoiceLayout.items.columns.tax,
			y,
			size: 8,
			font: boldFont,
			color: rgb(0, 0, 0),
		});

		page.drawText("Discount", {
			x: invoiceLayout.items.columns.discount,
			y,
			size: 8,
			font: boldFont,
			color: rgb(0, 0, 0),
		});

		page.drawText("Total", {
			x: invoiceLayout.items.columns.total,
			y,
			size: 8,
			font: boldFont,
			color: rgb(0, 0, 0),
		});

		page.drawLine({
			start: {
				x: 52,
				y: y - 8,
			},
			end: {
				x: 550,
				y: y - 8,
			},
			thickness: 0.5,
			color: rgb(0.5, 0.5, 0.5),
		});
	};

	const drawTotals = (page: ReturnType<PDFDocument["getPages"]>[number]) => {
		const totalQuantity = invoice.items.reduce(
			(total, item) => total + item.quantity,
			0,
		);
		const totalAmountWithoutTax = invoice.items.reduce((total, item) => {
			const amount =
				item.mrp > 0
					? (item.mrp / 1.18) * item.quantity
					: item.sellingPrice * item.quantity;

			return total + amount;
		}, 0);
		const totalDiscount = invoice.items.reduce(
			(total, item) => total + item.discount,
			0,
		);
		const formatAmount = (value: number) =>
			value.toLocaleString("en-IN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});

		const y = 155;
		page.drawLine({
			start: {
				x: 52,
				y: y + 12,
			},
			end: {
				x: 550,
				y: y + 12,
			},
			thickness: 0.5,
			color: rgb(0.5, 0.5, 0.5),
		});

		page.drawText(String(totalQuantity), {
			x: invoiceLayout.items.columns.qty,
			y,
			size: 8,
			font: boldFont,
			color: rgb(0, 0, 0),
		});

		page.drawText(formatAmount(totalAmountWithoutTax), {
			x: invoiceLayout.items.columns.amount,
			y,
			size: 8,
			font: boldFont,
			color: rgb(0, 0, 0),
		});

		page.drawText(formatAmount(invoice.taxTotal), {
			x: invoiceLayout.items.columns.tax,
			y,
			size: 8,
			font: boldFont,
			color: rgb(0, 0, 0),
		});

		page.drawText(formatAmount(totalDiscount), {
			x: invoiceLayout.items.columns.discount,
			y,
			size: 8,
			font: boldFont,
			color: rgb(0, 0, 0),
		});

		page.drawText(formatAmount(invoice.grandTotal), {
			x: invoiceLayout.items.columns.total,
			y,
			size: 8,
			font: boldFont,
			color: rgb(0, 0, 0),
		});

		const amountInWords = toWords.convert(invoice.grandTotal, {
			currency: true,
		});
		const amountInWordsText = `Amount in Words: ${amountInWords}`;
		const amountInWordsSize = 8;
		const amountInWordsX = invoiceLayout.items.columns.name;
		const amountInWordsY = y - 18;
		const amountInWordsPadding = 4;

		page.drawRectangle({
			x: amountInWordsX - amountInWordsPadding,
			y: amountInWordsY - amountInWordsPadding,
			width: 500,
			height: amountInWordsSize + amountInWordsPadding * 2,
			color: rgb(8 / 255, 45 / 255, 32 / 255),
		});

		page.drawText(amountInWordsText, {
			x: amountInWordsX,
			y: amountInWordsY,
			size: amountInWordsSize,
			font,
			color: rgb(1, 1, 1),
		});
	};

	let currentItemIndex = 0;
	let pageIndex = 0;

	while (currentItemIndex < invoice.items.length) {
		const normalPageItems = getPageItems(currentItemIndex, false);
		const remainingItems = invoice.items.length - currentItemIndex;
		const isPotentialFinalPage = normalPageItems.length === remainingItems;

		let pageItems = normalPageItems;
		let isFinalPage = false;

		if (isPotentialFinalPage) {
			const finalPageItems = getPageItems(currentItemIndex, true);

			if (finalPageItems.length === remainingItems) {
				pageItems = finalPageItems;
				isFinalPage = true;
			}
		}

		let page;

		if (pageIndex === 0) {
			page = firstPage;
			drawTableHeader(page);
		} else {
			const [copiedPage] = await pdfDoc.copyPages(templateDoc, [0]);

			pdfDoc.addPage(copiedPage);
			page = copiedPage;

			page.drawText(`Invoice: ${invoice.invoiceNumber}`, {
				x: invoiceLayoutData.number.x,
				y: invoiceLayoutData.number.y,
				size: invoiceLayout.fontSize,
				font: boldFont,
				color: rgb(0, 0, 0),
			});

			drawTableHeader(page);
		}

		drawPageItems(page, pageItems, invoiceLayout.items.startY);

		if (isFinalPage) {
			drawTotals(page);
		}

		const lastItem = pageItems[pageItems.length - 1];
		currentItemIndex = lastItem.index + 1;
		pageIndex++;
	}

	drawTotals(pdfDoc.getPages()[pdfDoc.getPageCount() - 1]);

	const pdfBytes = await pdfDoc.save();
	return pdfBytes;
}
