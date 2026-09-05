import { ToWords } from "to-words";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const invoiceLayout = {
	customer: {
		name: {
			x: 15,
			y: 600,
		},
		phone: {
			x: 15,
			y: 585,
		},
		address: {
			x: 295,
			y: 600,
		},
	},

	invoice: {
		number: {
			x: 460,
			y: 660,
		},
		date: {
			x: 460,
			y: 645,
		},
	},

	items: {
		startY: 540,
		minRowHeight: 24,
		endY: 240,
		nameMaxWidth: 200,
		totalsHeight: 120,

		columns: {
			name: 15,
			qty: 263,
			amount: 335,
			tax: 415,
			discount: 480,
			total: 568,
		},
	},
	fontSize: 9,
};

type InvoicePdfData = {
	invoiceNumber: string;
	createdAt: string;
	documentType?: "bill" | "quotation";

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

const roundMoney = (value: number) =>
	Math.round((value + Number.EPSILON) * 100) / 100;

export async function createInvoicePdf(invoice: InvoicePdfData) {
	const isQuotation =
		invoice.documentType === "quotation" ||
		invoice.invoiceNumber?.startsWith("QT-");

	const templatePath = isQuotation
		? "/templates/quotation-template.pdf"
		: "/templates/invoice-template.pdf";

	const response = await fetch(templatePath);

	if (!response.ok) {
		throw new Error(
			`Failed to load ${isQuotation ? "quotation" : "invoice"} template`,
		);
	}

	const templateBytes = await response.arrayBuffer();
	const templateDoc = await PDFDocument.load(templateBytes);
	const pdfDoc = await PDFDocument.load(templateBytes);
	const pages = pdfDoc.getPages();

	if (pages.length === 0) {
		throw new Error(
			`${isQuotation ? "Quotation" : "Invoice"} template has no pages`,
		);
	}

	const firstPage = pages[0];

	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
	const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
	const { customer, invoice: invoiceLayoutData } = invoiceLayout;

	const invoiceNumberText = isQuotation
		? `Quotation Number: ${invoice.invoiceNumber}`
		: `Invoice Number: ${invoice.invoiceNumber}`;

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

	firstPage.drawText(`Customer Name: ${invoice.customerName}`, {
		x: customer.name.x,
		y: customer.name.y,
		size: invoiceLayout.fontSize,
		font: boldFont,
		color: rgb(0, 0, 0),
	});

	if (invoice.customerPhone) {
		firstPage.drawText(`Mobile No: ${invoice.customerPhone}`, {
			x: customer.phone.x,
			y: customer.phone.y,
			size: invoiceLayout.fontSize,
			font,
			color: rgb(0, 0, 0),
		});
	}

	firstPage.drawText(invoiceNumberText, {
		x: invoiceLayoutData.number.x,
		y: invoiceLayoutData.number.y,
		size: invoiceLayout.fontSize,
		font: boldFont,
		color: rgb(0, 0, 0),
	});

	const invoiceDateText = new Date(invoice.createdAt).toLocaleDateString(
		"en-IN",
		{
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		},
	);

	firstPage.drawText(`Date :${invoiceDateText}`, {
		x: invoiceLayoutData.date.x,
		y: invoiceLayoutData.date.y,
		size: invoiceLayout.fontSize,
		font,
		color: rgb(0, 0, 0),
	});

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

		const amountText = amountWithoutTax.toLocaleString("en-IN", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});

		page.drawText(amountText, {
			x:
				invoiceLayout.items.columns.amount -
				font.widthOfTextAtSize(amountText, fontSize),
			y,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});

		const taxText = item.tax.toLocaleString("en-IN", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});

		page.drawText(taxText, {
			x:
				invoiceLayout.items.columns.tax -
				font.widthOfTextAtSize(taxText, fontSize),
			y,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});

		const discountText = item.discount.toLocaleString("en-IN", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});

		page.drawText(discountText, {
			x:
				invoiceLayout.items.columns.discount -
				font.widthOfTextAtSize(discountText, fontSize),
			y,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});

		const totalText = item.lineTotal.toLocaleString("en-IN", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});

		page.drawText(totalText, {
			x:
				invoiceLayout.items.columns.total -
				font.widthOfTextAtSize(totalText, fontSize),
			y,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});
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

		// Draw table header background bar (#383838)
		page.drawRectangle({
			x: 10,
			y: y - 6,
			width: 575,
			height: 20,
			color: rgb(56 / 255, 56 / 255, 56 / 255),
		});

		page.drawText("Item & Description", {
			x: invoiceLayout.items.columns.name,
			y,
			size: 8,
			font: boldFont,
			color: rgb(1, 1, 1),
		});

		page.drawText("Qty", {
			x: invoiceLayout.items.columns.qty,
			y,
			size: 8,
			font: boldFont,
			color: rgb(1, 1, 1),
		});

		const amountHeader = "Amount";
		page.drawText(amountHeader, {
			x:
				invoiceLayout.items.columns.amount -
				boldFont.widthOfTextAtSize(amountHeader, 8),
			y,
			size: 8,
			font: boldFont,
			color: rgb(1, 1, 1),
		});

		const taxHeader = "Tax";
		page.drawText(taxHeader, {
			x:
				invoiceLayout.items.columns.tax -
				boldFont.widthOfTextAtSize(taxHeader, 8),
			y,
			size: 8,
			font: boldFont,
			color: rgb(1, 1, 1),
		});

		const discountHeader = "Discount";
		page.drawText(discountHeader, {
			x:
				invoiceLayout.items.columns.discount -
				boldFont.widthOfTextAtSize(discountHeader, 8),
			y,
			size: 8,
			font: boldFont,
			color: rgb(1, 1, 1),
		});

		const totalHeader = "Total";
		page.drawText(totalHeader, {
			x:
				invoiceLayout.items.columns.total -
				boldFont.widthOfTextAtSize(totalHeader, 8),
			y,
			size: 8,
			font: boldFont,
			color: rgb(1, 1, 1),
		});
	};

	const drawTotals = (page: ReturnType<PDFDocument["getPages"]>[number]) => {
		const totalQuantity = invoice.items.reduce(
			(total, item) => total + item.quantity,
			0,
		);

		const totalDiscount = invoice.items.reduce(
			(total, item) => total + item.discount,
			0,
		);

		const taxableAmount = roundMoney(invoice.grandTotal - invoice.taxTotal);

		const cgst = roundMoney(invoice.taxTotal / 2);
		const sgst = roundMoney(invoice.taxTotal / 2);

		const formatAmount = (value: number) =>
			value.toLocaleString("en-IN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});

		const subtotalY = 280;

		page.drawLine({
			start: {
				x: 15,
				y: subtotalY + 12,
			},
			end: {
				x: 580,
				y: subtotalY + 12,
			},
			thickness: 0.5,
			color: rgb(0.5, 0.5, 0.5),
		});

		page.drawText("SUBTOTAL", {
			x: invoiceLayout.items.columns.name,
			y: subtotalY,
			size: 8,
			font: boldFont,
			color: rgb(0, 0, 0),
		});

		page.drawText(String(totalQuantity), {
			x: invoiceLayout.items.columns.qty,
			y: subtotalY,
			size: 8,
			font: boldFont,
			color: rgb(0, 0, 0),
		});

		const taxableText = formatAmount(taxableAmount);
		page.drawText(taxableText, {
			x:
				invoiceLayout.items.columns.amount -
				boldFont.widthOfTextAtSize(taxableText, 8),
			y: subtotalY,
			size: 8,
			font: boldFont,
			color: rgb(0, 0, 0),
		});

		const taxTotalText = formatAmount(invoice.taxTotal);
		page.drawText(taxTotalText, {
			x:
				invoiceLayout.items.columns.tax -
				boldFont.widthOfTextAtSize(taxTotalText, 8),
			y: subtotalY,
			size: 8,
			font: boldFont,
			color: rgb(0, 0, 0),
		});

		const discountTotalText = formatAmount(totalDiscount);
		page.drawText(discountTotalText, {
			x:
				invoiceLayout.items.columns.discount -
				boldFont.widthOfTextAtSize(discountTotalText, 8),
			y: subtotalY,
			size: 8,
			font: boldFont,
			color: rgb(0, 0, 0),
		});

		const grandTotalText = formatAmount(invoice.grandTotal);
		page.drawText(grandTotalText, {
			x:
				invoiceLayout.items.columns.total -
				boldFont.widthOfTextAtSize(grandTotalText, 8),
			y: subtotalY,
			size: 8,
			font: boldFont,
			color: rgb(0, 0, 0),
		});

		page.drawLine({
			start: {
				x: 15,
				y: subtotalY - 8,
			},
			end: {
				x: 580,
				y: subtotalY - 8,
			},
			thickness: 0.5,
			color: rgb(0.5, 0.5, 0.5),
		});

		const summaryLabelX = 400;
		const summaryAmountX = 568;

		const taxableY = 260;
		const cgstY = 240;
		const sgstY = 220;
		const totalY = 200;

		const drawSummaryRow = (
			label: string,
			value: number,
			y: number,
			fontToUse = font,
			textcolor = rgb(0, 0, 0),
		) => {
			page.drawText(label, {
				x: summaryLabelX,
				y,
				size: 8,
				font: fontToUse,
				color: textcolor,
			});

			const formattedValue = formatAmount(value);

			page.drawText(formattedValue, {
				x: summaryAmountX - font.widthOfTextAtSize(formattedValue, 8),
				y,
				size: 8,
				font: fontToUse,
				color: textcolor,
			});
		};

		drawSummaryRow("Taxable Amount", taxableAmount, taxableY);
		drawSummaryRow("CGST @9%", cgst, cgstY);
		drawSummaryRow("SGST @9%", sgst, sgstY);

		page.drawRectangle({
			x: 10,
			y: totalY - 6,
			width: 575,
			height: 20,
			color: rgb(56 / 255, 56 / 255, 56 / 255),
		});

		drawSummaryRow(
			"Total Amount",
			invoice.grandTotal,
			totalY,
			boldFont,
			rgb(1, 1, 1),
		);

		const amountInWords = toWords.convert(invoice.grandTotal, {
			currency: true,
		});

		const amountInWordsText = `Amount in Words: ${amountInWords}`;

		page.drawText(amountInWordsText, {
			x: 15,
			y: 200,
			size: 8,
			font: boldFont,
			color: rgb(1, 1, 1),
		});
	};

	let currentItemIndex = 0;
	let pageIndex = 0;
	let totalsDrawn = false;

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

			page.drawText(invoiceNumberText, {
				x: invoiceLayoutData.number.x,
				y: invoiceLayoutData.number.y,
				size: invoiceLayout.fontSize,
				font: boldFont,
				color: rgb(0, 0, 0),
			});

			drawTableHeader(page);
		}

		drawPageItems(page, pageItems, invoiceLayout.items.startY);

		const lastItem = pageItems[pageItems.length - 1];
		const nextItemIndex = lastItem.index + 1;
		const hasMoreItems = nextItemIndex < invoice.items.length;

		if (hasMoreItems) {
			let itemsHeight = 0;
			for (const pi of pageItems) {
				itemsHeight += pi.height;
			}
			const afterItemsY = invoiceLayout.items.startY - itemsHeight;
			const continuationY = Math.max(afterItemsY - 14, 250);

			const continuationText = "Continued on next page...";
			const textWidth = italicFont.widthOfTextAtSize(continuationText, 8);

			page.drawText(continuationText, {
				x: 550 - textWidth,
				y: continuationY,
				size: 8,
				font: italicFont,
				color: rgb(0.45, 0.45, 0.45),
			});

			page.drawLine({
				start: {
					x: 15,
					y: 190,
				},
				end: {
					x: 580,
					y: 190,
				},
				thickness: 0.5,
				color: rgb(0.5, 0.5, 0.5),
			});
		}

		if (isFinalPage) {
			drawTotals(page);
			totalsDrawn = true;
		}

		currentItemIndex = nextItemIndex;
		pageIndex++;
	}

	if (!totalsDrawn) {
		drawTotals(pdfDoc.getPages()[pdfDoc.getPageCount() - 1]);
	}

	const pdfBytes = await pdfDoc.save();
	return pdfBytes;
}
