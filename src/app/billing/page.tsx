"use client";

import {
	Box,
	Button,
	Card,
	CardContent,
	Container,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import {
	getSubtotal,
	getLineTotal,
	getGrandTotal,
	getTotalDiscount,
	getDiscountAmount,
	getDiscountPercentage,
	hasMrp,
	getTotalTax,
	getTaxAmount,
} from "@/lib/calculations/billing";
import { Product } from "@/types/product";
import { createInvoiceWithItems, updateInvoiceWithItems } from "./actions";
import { useEffect, useRef, useState } from "react";
import { DeleteOutlined } from "@mui/icons-material";
import AppShell from "@/components/layout/app-shell";
import { createInvoicePdf } from "@/lib/pdf/invoice";
import { getProducts } from "@/lib/products/product-service";
import { getInvoiceWithItems } from "@/lib/invoices/invoice-service";
import type {
	BillItem,
	InvoicePreviewData,
	PaymentStatus,
} from "@/types/billing";
import ProductForm from "@/components/products/product-form";

export default function BillingPage() {
	const [loading, setLoading] = useState(false);
	const [invoiceLoading, setInvoiceLoading] = useState(false);
	const [invoiceLoadError, setInvoiceLoadError] = useState("");
	const [customerName, setCustomerName] = useState("");
	const [customerPhone, setCustomerPhone] = useState("");
	const [customerEmail, setCustomerEmail] = useState("");
	const [customerAddress, setCustomerAddress] = useState("");
	const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("not_paid");
	const [amountReceived, setAmountReceived] = useState("");
	const [customerNameError, setCustomerNameError] = useState("");
	const [paymentError, setPaymentError] = useState("");
	const [newItemModalOpen, setNewItemModalOpen] = useState(false);

	const [invoicePreview, setInvoicePreview] =
		useState<InvoicePreviewData | null>(null);

	const [searchQuery, setSearchQuery] = useState("");
	const [products, setProducts] = useState<Product[]>([]);
	const [billItems, setBillItems] = useState<BillItem[]>([]);
	const invoicePreviewRef = useRef<HTMLDivElement | null>(null);
	const [productsLoading, setProductsLoading] = useState(false);
	const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
	const invoiceLoadRequestRef = useRef(0);

	const taxTotal = getTotalTax(billItems);
	const subtotal = getSubtotal(billItems);
	const grandTotal = getGrandTotal(billItems);
	const totalDiscount = getTotalDiscount(billItems);
	const parsedAmountReceived =
		amountReceived === "" ? 0 : Number(amountReceived);
	const numericAmountReceived = Number.isFinite(parsedAmountReceived)
		? Math.max(parsedAmountReceived, 0)
		: 0;
	const normalizedAmountReceived =
		paymentStatus === "fully_paid"
			? grandTotal
			: paymentStatus === "not_paid"
				? 0
				: Math.min(numericAmountReceived, grandTotal);
	const amountPending = Math.max(grandTotal - normalizedAmountReceived, 0);

	useEffect(() => {
		const loadProducts = async () => {
			setProductsLoading(true);

			try {
				const data = await getProducts();

				setProducts(data);
			} catch (error) {
				console.error("Failed to load products:", error);
			} finally {
				setProductsLoading(false);
			}
		};

		loadProducts();
	}, []);

	useEffect(() => {
		const invoiceId = new URLSearchParams(window.location.search).get(
			"invoiceId",
		);

		if (!invoiceId) {
			return;
		}

		const requestId = invoiceLoadRequestRef.current + 1;
		invoiceLoadRequestRef.current = requestId;
		let cancelled = false;

		const loadInvoice = async () => {
			setInvoiceLoading(true);
			setInvoiceLoadError("");

			try {
				const { invoice, items } = await getInvoiceWithItems(invoiceId);

				if (cancelled || invoiceLoadRequestRef.current !== requestId) {
					return;
				}

				setEditingInvoiceId(invoice.id);
				setCustomerName(invoice.customer_name);
				setCustomerPhone(invoice.customer_phone);
				setCustomerEmail(invoice.customer_email);
				setCustomerAddress(invoice.customer_address);
				setPaymentStatus(invoice.payment_status);
				setAmountReceived(
					invoice.amount_received > 0 ? String(invoice.amount_received) : "",
				);
				setBillItems(
					items.map((item) => ({
						lineItemId: item.id,
						productId: item.product_id,
						name: item.name,
						type: item.type,
						category: item.category,
						mrp: item.mrp,
						quantity: item.quantity,
						sellingPrice: String(item.selling_price),
					})),
				);
			} catch (error) {
				if (cancelled || invoiceLoadRequestRef.current !== requestId) {
					return;
				}

				console.error("Failed to load invoice:", error);
				setInvoiceLoadError("Unable to load this bill. Please try again.");
			} finally {
				setInvoiceLoading(false);
			}
		};

		void loadInvoice();

		return () => {
			cancelled = true;
		};
	}, []);

	const validateCustomerDetails = () => {
		if (!customerName.trim()) {
			setCustomerNameError("Customer name is required.");
			return false;
		}

		setCustomerNameError("");
		return true;
	};

	const validatePaymentDetails = () => {
		if (paymentStatus === "partially_paid") {
			const parsed = Number(amountReceived);
			if (
				amountReceived.trim() === "" ||
				!Number.isFinite(parsed) ||
				parsed <= 0 ||
				parsed >= grandTotal
			) {
				setPaymentError(
					"Amount received must be greater than 0 and less than the total bill.",
				);
				return false;
			}
		}

		setPaymentError("");
		return true;
	};

	const handlePaymentStatusChange = (nextStatus: PaymentStatus) => {
		setPaymentStatus(nextStatus);
		setPaymentError("");

		if (nextStatus === "not_paid") {
			setAmountReceived("");
			return;
		}

		if (nextStatus === "fully_paid") {
			setAmountReceived(String(grandTotal));
			return;
		}

		if (nextStatus === "partially_paid") {
			const parsed = Number(amountReceived);
			if (
				amountReceived === "" ||
				!Number.isFinite(parsed) ||
				parsed <= 0 ||
				parsed >= grandTotal
			) {
				setAmountReceived("");
			}
		}
	};

	const handleDownloadPdf = async () => {
		if (!invoicePreview) {
			return;
		}

		try {
			const pdfBytes = await createInvoicePdf(invoicePreview);

			const arrayBuffer = new ArrayBuffer(pdfBytes.byteLength);

			new Uint8Array(arrayBuffer).set(pdfBytes);

			const blob = new Blob([arrayBuffer], {
				type: "application/pdf",
			});
			const url = URL.createObjectURL(blob);

			const link = document.createElement("a");
			link.href = url;
			link.download = `${invoicePreview.invoiceNumber}.pdf`;

			document.body.appendChild(link);

			const isIOS =
				/iPad|iPhone|iPod/.test(navigator.userAgent) ||
				(navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

			if (isIOS) {
				window.open(url, "_blank");
			} else {
				link.click();
			}

			link.remove();

			setTimeout(() => {
				URL.revokeObjectURL(url);
			}, 1000);
		} catch (error) {
			console.error("Failed to generate PDF:", error);
		}
	};

	const filteredProducts = products.filter((product) => {
		const query = searchQuery.trim().toLowerCase();

		if (!query) {
			return [];
		}

		return (
			product.name.toLowerCase().includes(query) ||
			product.category.toLowerCase().includes(query)
		);
	});

	const addItemToBill = (product: Product) => {
		setBillItems((currentItems) => {
			const existingItem = currentItems.find(
				(item) => item.productId === product.id,
			);

			if (existingItem) {
				return currentItems.map((item) =>
					item.productId === product.id
						? {
								...item,
								quantity: item.quantity + 1,
							}
						: item,
				);
			}

			return [
				...currentItems,
				{
					lineItemId: crypto.randomUUID(),
					productId: product.id,
					name: product.name,
					type: product.type,
					category: product.category,
					mrp: product.mrp,
					quantity: 1,
					sellingPrice: String(product.mrp),
				},
			];
		});

		setSearchQuery("");
	};

	const updateItemQuantity = (lineItemId: string, quantity: number) => {
		if (quantity < 1) {
			return;
		}

		setBillItems((currentItems) =>
			currentItems.map((item) =>
				item.lineItemId === lineItemId
					? {
							...item,
							quantity,
						}
					: item,
			),
		);
	};

	const updateItemSellingPrice = (lineItemId: string, sellingPrice: string) => {
		setBillItems((currentItems) =>
			currentItems.map((item) =>
				item.lineItemId === lineItemId
					? {
							...item,
							sellingPrice,
						}
					: item,
			),
		);
	};

	const removeItemFromBill = (lineItemId: string) => {
		setBillItems((currentItems) =>
			currentItems.filter((item) => item.lineItemId !== lineItemId),
		);
	};

	const handleGenerateBill = async () => {
		if (
			!validateCustomerDetails() ||
			!validatePaymentDetails() ||
			billItems.length === 0
		) {
			return;
		}

		try {
			setLoading(true);

			console.log(
				"Saving bill items:",
				billItems.map((item) => ({
					lineItemId: item.lineItemId,
					productId: item.productId,
					name: item.name,
					sellingPrice: item.sellingPrice,
					quantity: item.quantity,
				})),
			);

			const invoiceItems = billItems.map((item) => ({
				lineItemId: item.lineItemId,
				productId: item.productId,
				name: item.name,
				type: item.type,
				category: item.category,
				mrp: item.mrp,
				sellingPrice: Number(item.sellingPrice || 0),
				quantity: item.quantity,
				discount: getDiscountAmount(item),
				discountPercentage: getDiscountPercentage(item),
				tax: getTaxAmount(item),
				lineTotal: getLineTotal(item),
			}));

			const invoiceInput = {
				invoiceId: editingInvoiceId,
				customerName: customerName.trim(),
				customerPhone: customerPhone.trim(),
				customerEmail: customerEmail.trim(),
				customerAddress: customerAddress.trim(),
				subtotal,
				discountTotal: totalDiscount,
				taxTotal,
				grandTotal,
				paymentStatus,
				amountReceived: normalizedAmountReceived,
				amountPending,
			};
			const invoice = editingInvoiceId
				? await updateInvoiceWithItems(
						editingInvoiceId,
						invoiceInput,
						invoiceItems,
					)
				: await createInvoiceWithItems(invoiceInput, invoiceItems);
			setEditingInvoiceId(invoice.id);

			const previewData: InvoicePreviewData = {
				invoiceNumber: invoice.invoice_number,
				createdAt: invoice.created_at,

				customerName: customerName.trim(),
				customerPhone: customerPhone.trim(),
				customerEmail: customerEmail.trim(),
				customerAddress: customerAddress.trim(),

				subtotal,
				discountTotal: totalDiscount,
				taxTotal,
				grandTotal,
				paymentStatus,
				amountReceived: normalizedAmountReceived,
				amountPending,

				items: invoiceItems,
			};

			setInvoicePreview(previewData);
			setTimeout(() => {
				invoicePreviewRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}, 100);
		} catch (error) {
			console.error("Failed to create invoice:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleNewBill = () => {
		setInvoicePreview(null);
		setEditingInvoiceId(null);

		setCustomerName("");
		setCustomerPhone("");
		setCustomerEmail("");
		setCustomerAddress("");
		setPaymentStatus("not_paid");
		setAmountReceived("");

		setBillItems([]);

		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	const handleEditBill = () => {
		setInvoicePreview(null);

		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	const handleNewItemCreated = (product?: Product) => {
		if (!product) {
			return;
		}

		setBillItems((currentItems) => [
			...currentItems,
			{
				lineItemId: crypto.randomUUID(),
				productId: product.id,
				name: product.name,
				type: product.type,
				category: product.category,
				mrp: product.mrp,
				quantity: 1,
				sellingPrice: String(product.mrp),
			},
		]);

		setNewItemModalOpen(false);
	};
	return (
		<AppShell>
			<Container
				maxWidth='lg'
				sx={{
					py: {
						xs: 3,
						sm: 5,
					},
				}}
			>
				{invoiceLoading && (
					<Typography color='text.secondary' sx={{ mb: 3 }}>
						Loading bill...
					</Typography>
				)}
				{invoiceLoadError && (
					<Typography color='error' sx={{ mb: 3 }}>
						{invoiceLoadError}
					</Typography>
				)}
				{!invoicePreview && (
					<Stack spacing={4}>
						{/* Header */}
						<Box>
							<Typography
								variant='h4'
								sx={{
									fontWeight: 700,
									mb: 1,
								}}
							>
								{editingInvoiceId ? "Edit Bill" : "New Bill"}
							</Typography>

							<Typography variant='body1' color='text.secondary'>
								{editingInvoiceId
									? "Update the saved invoice for your customer."
									: "Create a new invoice for your customer."}
							</Typography>
						</Box>

						{/* Customer */}
						<Card>
							<CardContent>
								<Stack spacing={3}>
									<Box>
										<Typography variant='h6' sx={{ fontWeight: 700 }}>
											Customer Details
										</Typography>

										<Typography variant='body2' color='text.secondary'>
											Enter the customer&apos;s information.
										</Typography>
									</Box>

									<Stack
										direction={{
											xs: "column",
											sm: "row",
										}}
										spacing={2}
									>
										<TextField
											fullWidth
											value={customerName}
											label='Customer Name'
											helperText={customerNameError}
											placeholder='Enter customer name'
											error={Boolean(customerNameError)}
											onChange={(event) => {
												setCustomerName(event.target.value);
												setCustomerNameError("");
											}}
										/>
										<TextField
											fullWidth
											type='tel'
											label='Phone Number'
											value={customerPhone}
											placeholder='Enter phone number'
											onChange={(event) => setCustomerPhone(event.target.value)}
										/>
									</Stack>

									<Stack
										direction={{
											xs: "column",
											sm: "row",
										}}
										spacing={2}
									>
										<TextField
											fullWidth
											type='email'
											label='Email'
											value={customerEmail}
											placeholder='customer@example.com'
											onChange={(event) => setCustomerEmail(event.target.value)}
										/>
										<TextField
											fullWidth
											multiline
											minRows={2}
											label='Address'
											value={customerAddress}
											placeholder='Customer address'
											onChange={(event) =>
												setCustomerAddress(event.target.value)
											}
										/>
									</Stack>
								</Stack>
							</CardContent>
						</Card>

						{/* Items */}
						<Card
							sx={{
								overflow: "visible",
							}}
						>
							<CardContent>
								<Stack spacing={3}>
									<Box>
										<Typography variant='h6' sx={{ fontWeight: 700 }}>
											Bill Items
										</Typography>

										<Typography variant='body2' color='text.secondary'>
											Add products or services to this bill.
										</Typography>
									</Box>

									{/* Search */}
									<Box sx={{ position: "relative" }}>
										<Stack
											direction={{ xs: "column", sm: "row" }}
											spacing={2}
											sx={{
												alignItems: { xs: "stretch", sm: "flex-start" },
											}}
										>
											<TextField
												fullWidth
												autoComplete='off'
												value={searchQuery}
												label='Search products or services'
												placeholder='Search by name or category...'
												onChange={(event) => setSearchQuery(event.target.value)}
											/>

											<Button
												fullWidth
												variant='outlined'
												onClick={() => setNewItemModalOpen(true)}
												sx={{
													minHeight: 36,
													width: { xs: "100%", sm: "auto" },
													whiteSpace: "nowrap",
												}}
											>
												+ New Item
											</Button>
										</Stack>

										{/* Search Results Dropdown */}
										{searchQuery.trim() && (
											<Card
												variant='outlined'
												sx={{
													position: "absolute",
													top: "calc(100% + 6px)",
													left: 0,
													right: 0,
													zIndex: 10,
													maxHeight: 320,
													overflowY: "auto",
													boxShadow: 3,
												}}
											>
												{productsLoading ? (
													<Box sx={{ p: 2.5 }}>
														<Typography variant='body2' color='text.secondary'>
															Loading products...
														</Typography>
													</Box>
												) : filteredProducts.length === 0 ? (
													<Box sx={{ p: 2.5 }}>
														<Typography variant='body2' color='text.secondary'>
															No matching products or services found.
														</Typography>
													</Box>
												) : (
													<Stack>
														{filteredProducts.map((product) => (
															<Box
																key={product.id}
																onClick={() => addItemToBill(product)}
																sx={{
																	px: 2,
																	py: 1.5,
																	cursor: "pointer",
																	borderBottom: "1px solid",
																	borderColor: "divider",
																	transition: "background-color 0.15s ease",

																	"&:hover": {
																		bgcolor: "action.hover",
																	},

																	"&:last-child": {
																		borderBottom: "none",
																	},
																}}
															>
																<Stack
																	direction='row'
																	sx={{
																		alignItems: "center",
																		justifyContent: "space-between",
																		gap: 2,
																	}}
																>
																	<Box sx={{ minWidth: 0 }}>
																		<Typography
																			sx={{
																				fontWeight: 600,
																				overflow: "hidden",
																				textOverflow: "ellipsis",
																				whiteSpace: "nowrap",
																			}}
																		>
																			{product.name}
																		</Typography>

																		<Typography
																			variant='body2'
																			color='text.secondary'
																		>
																			{product.type} · {product.category}
																		</Typography>
																	</Box>

																	<Typography
																		sx={{
																			fontWeight: 600,
																			whiteSpace: "nowrap",
																		}}
																	>
																		₹{product.mrp.toLocaleString("en-IN")}
																	</Typography>
																</Stack>
															</Box>
														))}
													</Stack>
												)}
											</Card>
										)}
									</Box>

									{/* Bill Items */}
									{billItems.length === 0 ? (
										<Box
											sx={{
												minHeight: 180,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												textAlign: "center",
											}}
										>
											<Stack spacing={1}>
												<Typography variant='body1' sx={{ fontWeight: 600 }}>
													No items added
												</Typography>

												<Typography variant='body2' color='text.secondary'>
													Search for a product or service to add it to the bill.
												</Typography>
											</Stack>
										</Box>
									) : (
										<Stack spacing={1.5}>
											{billItems.map((item) => (
												<Box
													key={item.lineItemId}
													sx={{
														p: 2,
														border: "1px solid",
														borderColor: "divider",
														borderRadius: 2,
													}}
												>
													<Stack spacing={2}>
														{/* Item Header */}
														<Stack
															direction='row'
															sx={{
																justifyContent: "space-between",
																alignItems: "flex-start",
																gap: 2,
															}}
														>
															<Box sx={{ minWidth: 0 }}>
																<Typography
																	sx={{
																		fontWeight: 600,
																	}}
																>
																	{item.name}
																</Typography>

																<Typography
																	variant='body2'
																	color='text.secondary'
																>
																	{item.type} · {item.category}
																</Typography>
															</Box>

															<IconButton
																aria-label={`Remove ${item.name}`}
																onClick={() =>
																	removeItemFromBill(item.lineItemId)
																}
																size='small'
															>
																<DeleteOutlined fontSize='small' />
															</IconButton>
														</Stack>

														{/* Item Controls */}
														<Stack
															direction={{
																xs: "column",
																sm: "row",
															}}
															spacing={2}
															sx={{
																alignItems: {
																	xs: "stretch",
																	sm: "center",
																},
															}}
														>
															{/* MRP */}
															<Box
																sx={{
																	minWidth: {
																		sm: 110,
																	},
																}}
															>
																<Typography
																	variant='caption'
																	color='text.secondary'
																>
																	MRP / Unit
																</Typography>

																<Typography
																	sx={{
																		fontWeight: 600,
																	}}
																>
																	{item.mrp > 0
																		? `₹${item.mrp.toLocaleString("en-IN")}`
																		: "N/A"}{" "}
																</Typography>
															</Box>

															{/* Quantity */}
															<Box>
																<Typography
																	variant='caption'
																	color='text.secondary'
																>
																	Quantity
																</Typography>

																<Stack
																	direction='row'
																	spacing={1}
																	sx={{
																		alignItems: "center",
																	}}
																>
																	<Button
																		variant='outlined'
																		size='small'
																		onClick={() =>
																			updateItemQuantity(
																				item.lineItemId,
																				item.quantity - 1,
																			)
																		}
																		disabled={item.quantity <= 1}
																		sx={{
																			minWidth: 36,
																			width: 36,
																			height: 36,
																			p: 0,
																		}}
																	>
																		−
																	</Button>

																	<Typography
																		sx={{
																			minWidth: 28,
																			textAlign: "center",
																			fontWeight: 600,
																		}}
																	>
																		{item.quantity}
																	</Typography>

																	<Button
																		variant='outlined'
																		size='small'
																		onClick={() =>
																			updateItemQuantity(
																				item.lineItemId,
																				item.quantity + 1,
																			)
																		}
																		sx={{
																			minWidth: 36,
																			width: 36,
																			height: 36,
																			p: 0,
																		}}
																	>
																		+
																	</Button>
																</Stack>
															</Box>

															{/* Selling Price */}
															<TextField
																label='Selling Price / Unit'
																value={item.sellingPrice}
																onChange={(event) => {
																	const value = event.target.value;

																	if (
																		value === "" ||
																		/^\d*\.?\d*$/.test(value)
																	) {
																		if (
																			value === "" ||
																			item.mrp <= 0 ||
																			Number(value) <= item.mrp
																		) {
																			updateItemSellingPrice(
																				item.lineItemId,
																				value,
																			);
																		}
																	}
																}}
																type='text'
																inputMode='decimal'
																size='small'
																sx={{
																	width: {
																		xs: "100%",
																		sm: 220,
																	},
																}}
															/>
														</Stack>

														{/* Item Summary */}
														<Stack
															direction={{
																xs: "column",
																sm: "row",
															}}
															sx={{
																justifyContent: "space-between",
																alignItems: {
																	xs: "flex-start",
																	sm: "center",
																},
																gap: 1,
															}}
														>
															{hasMrp(item) ? (
																<Typography
																	variant='body2'
																	color='text.secondary'
																>
																	Discount:{" "}
																	{getDiscountPercentage(item).toFixed(2)}%
																	{" · "}₹
																	{getDiscountAmount(item).toLocaleString(
																		"en-IN",
																	)}
																</Typography>
															) : (
																<Typography
																	variant='body2'
																	color='text.secondary'
																>
																	Discount: N/A
																</Typography>
															)}

															<Typography
																sx={{
																	fontWeight: 700,
																}}
															>
																Line Total: ₹
																{getLineTotal(item).toLocaleString("en-IN")}
															</Typography>
														</Stack>
													</Stack>
												</Box>
											))}
										</Stack>
									)}
								</Stack>
							</CardContent>
						</Card>

						{/* Summary */}
						<Card>
							<CardContent>
								<Stack spacing={2}>
									<Typography variant='h6' sx={{ fontWeight: 700 }}>
										Bill Summary
									</Typography>

									<Stack
										direction='row'
										sx={{
											justifyContent: "space-between",
										}}
									>
										<Typography color='text.secondary'>Subtotal</Typography>

										<Typography>
											₹
											{subtotal.toLocaleString("en-IN", {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</Typography>
									</Stack>

									<Stack
										direction='row'
										sx={{
											justifyContent: "space-between",
										}}
									>
										<Typography color='text.secondary'>Discount</Typography>

										<Typography>
											₹
											{totalDiscount.toLocaleString("en-IN", {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</Typography>
									</Stack>

									<Divider />

									<Stack spacing={2}>
										<Typography variant='h6' sx={{ fontWeight: 700 }}>
											Payment Status
										</Typography>

										<FormControl fullWidth size='small'>
											<InputLabel id='payment-status-label'>
												Payment Status
											</InputLabel>
											<Select
												labelId='payment-status-label'
												value={paymentStatus}
												label='Payment Status'
												onChange={(event) =>
													handlePaymentStatusChange(
														event.target.value as PaymentStatus,
													)
												}
											>
												<MenuItem value='not_paid'>Not Paid</MenuItem>
												<MenuItem value='partially_paid'>
													Partially Paid
												</MenuItem>
												<MenuItem value='fully_paid'>Fully Paid</MenuItem>
											</Select>
										</FormControl>

										{paymentStatus === "partially_paid" && (
											<TextField
												fullWidth
												size='small'
												type='text'
												inputMode='decimal'
												label='Amount Received'
												placeholder='0.00'
												value={amountReceived}
												onChange={(event) => {
													const value = event.target.value;
													if (value === "" || /^\d*\.?\d*$/.test(value)) {
														setAmountReceived(value);
														if (paymentError) {
															setPaymentError("");
														}
													}
												}}
												error={Boolean(paymentError)}
												helperText={
													paymentError || "Enter the amount already received."
												}
											/>
										)}

										<Stack
											direction='row'
											sx={{ justifyContent: "space-between" }}
										>
											<Typography color='text.secondary'>
												Amount Received
											</Typography>
											<Typography>
												₹
												{normalizedAmountReceived.toLocaleString("en-IN", {
													minimumFractionDigits: 2,
													maximumFractionDigits: 2,
												})}
											</Typography>
										</Stack>

										<Stack
											direction='row'
											sx={{ justifyContent: "space-between" }}
										>
											<Typography color='text.secondary'>
												Amount Pending
											</Typography>
											<Typography>
												₹
												{amountPending.toLocaleString("en-IN", {
													minimumFractionDigits: 2,
													maximumFractionDigits: 2,
												})}
											</Typography>
										</Stack>
									</Stack>

									<Stack
										direction='row'
										sx={{
											justifyContent: "space-between",
										}}
									>
										<Typography variant='h6' sx={{ fontWeight: 700 }}>
											Total
										</Typography>

										<Typography variant='h6' sx={{ fontWeight: 700 }}>
											₹
											{grandTotal.toLocaleString("en-IN", {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</Typography>
									</Stack>
									<Button
										variant='contained'
										size='large'
										fullWidth
										onClick={handleGenerateBill}
										disabled={loading}
									>
										{loading
											? editingInvoiceId
												? "Updating Bill..."
												: "Creating Bill..."
											: editingInvoiceId
												? "Update Bill"
												: "Generate Bill"}
									</Button>
								</Stack>
							</CardContent>
						</Card>
					</Stack>
				)}

				{invoicePreview && (
					<Box ref={invoicePreviewRef} sx={{ mt: 4 }}>
						<Card
							sx={{
								mt: 4,
								borderRadius: 3,
								boxShadow: "none",
								border: "1px solid",
								borderColor: "divider",
							}}
						>
							<CardContent sx={{ p: { xs: 2, sm: 4 } }}>
								<Stack
									direction={{ xs: "column", sm: "row" }}
									sx={{
										justifyContent: "space-between",
										alignItems: {
											xs: "flex-start",
											sm: "flex-start",
										},
										gap: 3,
									}}
								>
									<Box>
										<Typography
											variant='h5'
											sx={{
												fontWeight: 800,
												letterSpacing: "-0.02em",
											}}
										>
											JEFF SYSTEMS
										</Typography>

										<Typography
											variant='body2'
											color='text.secondary'
											sx={{ mt: 0.5 }}
										>
											Billing Management
										</Typography>
									</Box>

									<Box
										sx={{
											textAlign: {
												xs: "left",
												sm: "right",
											},
										}}
									>
										<Typography
											variant='overline'
											color='text.secondary'
											sx={{
												fontWeight: 700,
												letterSpacing: "0.08em",
											}}
										>
											INVOICE
										</Typography>

										<Typography
											variant='h6'
											sx={{
												fontWeight: 700,
												lineHeight: 1.2,
											}}
										>
											{invoicePreview.invoiceNumber}
										</Typography>

										<Typography
											variant='body2'
											color='text.secondary'
											sx={{ mt: 0.5 }}
										>
											{new Date(invoicePreview.createdAt).toLocaleDateString(
												"en-IN",
												{
													day: "2-digit",
													month: "short",
													year: "numeric",
												},
											)}
										</Typography>
									</Box>
								</Stack>
								<Divider />
								<Box
									sx={{
										my: 1,
									}}
								>
									<Typography
										variant='caption'
										color='text.secondary'
										sx={{
											fontWeight: 700,
											letterSpacing: "0.06em",
										}}
									>
										BILL TO
									</Typography>

									<Stack spacing={0.5} sx={{ mt: 1 }}>
										<Typography sx={{ fontWeight: 600 }}>
											{invoicePreview.customerName}
										</Typography>

										{invoicePreview.customerPhone && (
											<Typography variant='body2' color='text.secondary'>
												{invoicePreview.customerPhone}
											</Typography>
										)}

										{invoicePreview.customerEmail && (
											<Typography variant='body2' color='text.secondary'>
												{invoicePreview.customerEmail}
											</Typography>
										)}

										{invoicePreview.customerAddress && (
											<Typography variant='body2' color='text.secondary'>
												{invoicePreview.customerAddress}
											</Typography>
										)}
									</Stack>
								</Box>

								{/* Invoice Items */}
								<Box>
									<Typography
										variant='h6'
										sx={{
											fontWeight: 700,
											mb: 2,
										}}
									>
										Items
									</Typography>

									<Stack spacing={1.5}>
										<Box
											sx={{
												width: "100%",
												overflowX: "auto",
											}}
										>
											<Box
												component='table'
												sx={{
													width: "100%",
													borderCollapse: "collapse",
													minWidth: 700,
												}}
											>
												<Box component='thead'>
													<Box component='tr'>
														{[
															"Item",
															"MRP / Unit",
															"Price / Unit",
															"Qty",
															"Discount",
															"Total",
														].map((heading) => (
															<Box
																key={heading}
																component='th'
																sx={{
																	px: 1.5,
																	py: 1.5,
																	textAlign:
																		heading === "Item" ? "left" : "right",
																	fontSize: "0.8rem",
																	fontWeight: 600,
																	color: "text.secondary",
																	bgcolor: "action.hover",
																	borderBottom: "1px solid",
																	borderColor: "divider",
																	whiteSpace: "nowrap",
																}}
															>
																{heading}
															</Box>
														))}
													</Box>
												</Box>

												<Box component='tbody'>
													{invoicePreview.items.map((item) => (
														<Box component='tr' key={item.lineItemId}>
															<Box
																component='td'
																sx={{
																	px: 1.5,
																	py: 2,
																	borderBottom: "1px solid",
																	borderColor: "divider",
																	width: "40%",
																	maxWidth: 320,
																	verticalAlign: "top",
																}}
															>
																<Typography
																	sx={{
																		fontWeight: 600,
																		overflowWrap: "anywhere",
																		wordBreak: "break-word",
																	}}
																>
																	{item.name}
																</Typography>

																<Typography
																	variant='caption'
																	color='text.secondary'
																>
																	{item.type} · {item.category}
																</Typography>
															</Box>

															<Box
																component='td'
																sx={{
																	px: 1.5,
																	py: 2,
																	textAlign: "right",
																	borderBottom: "1px solid",
																	borderColor: "divider",
																	whiteSpace: "nowrap",
																}}
															>
																{item.mrp > 0
																	? `₹${item.mrp.toLocaleString("en-IN")}`
																	: "N/A"}
															</Box>

															<Box
																component='td'
																sx={{
																	px: 1.5,
																	py: 2,
																	textAlign: "right",
																	borderBottom: "1px solid",
																	borderColor: "divider",
																	whiteSpace: "nowrap",
																}}
															>
																₹{item.sellingPrice.toLocaleString("en-IN")}
															</Box>

															<Box
																component='td'
																sx={{
																	px: 1.5,
																	py: 2,
																	textAlign: "right",
																	borderBottom: "1px solid",
																	borderColor: "divider",
																}}
															>
																{item.quantity}
															</Box>

															<Box
																component='td'
																sx={{
																	px: 1.5,
																	py: 2,
																	textAlign: "right",
																	borderBottom: "1px solid",
																	borderColor: "divider",
																	whiteSpace: "nowrap",
																}}
															>
																{item.discount > 0
																	? `₹${item.discount.toLocaleString("en-IN")}`
																	: "—"}
															</Box>

															<Box
																component='td'
																sx={{
																	px: 1.5,
																	py: 2,
																	textAlign: "right",
																	fontWeight: 700,
																	borderBottom: "1px solid",
																	borderColor: "divider",
																	whiteSpace: "nowrap",
																}}
															>
																₹{item.lineTotal.toLocaleString("en-IN")}
															</Box>
														</Box>
													))}
												</Box>
											</Box>
										</Box>
									</Stack>
								</Box>
								<Divider />

								{/* Invoice Totals */}
								<Stack
									spacing={1}
									sx={{
										width: "100%",
										maxWidth: 360,
										ml: "auto",
									}}
								>
									<Stack
										direction='row'
										sx={{
											justifyContent: "space-between",
											gap: 2,
										}}
									>
										<Typography color='text.secondary'>Subtotal</Typography>

										<Typography>
											₹{invoicePreview.subtotal.toLocaleString("en-IN")}
										</Typography>
									</Stack>

									{invoicePreview.discountTotal > 0 && (
										<Stack
											direction='row'
											sx={{
												justifyContent: "space-between",
												gap: 2,
											}}
										>
											<Typography color='text.secondary'>Discount</Typography>

											<Typography color='success.main'>
												- ₹
												{invoicePreview.discountTotal.toLocaleString("en-IN")}
											</Typography>
										</Stack>
									)}

									{invoicePreview.taxTotal > 0 && (
										<Stack
											direction='row'
											sx={{
												justifyContent: "space-between",
												gap: 2,
											}}
										>
											<Typography color='text.secondary'>Tax</Typography>

											<Typography>
												₹{invoicePreview.taxTotal.toLocaleString("en-IN")}
											</Typography>
										</Stack>
									)}

									<Divider />

									<Stack
										direction='row'
										sx={{
											justifyContent: "space-between",
											alignItems: "center",
											gap: 2,
											pt: 1,
										}}
									>
										<Typography variant='h6' sx={{ fontWeight: 700 }}>
											Grand Total
										</Typography>

										<Typography
											variant='h5'
											sx={{
												fontWeight: 800,
												whiteSpace: "nowrap",
											}}
										>
											₹{invoicePreview.grandTotal.toLocaleString("en-IN")}
										</Typography>
									</Stack>
								</Stack>
							</CardContent>
						</Card>
						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={1.5}
							sx={{
								mt: 2,
								justifyContent: "flex-end",
							}}
						>
							<Button variant='outlined' onClick={handleEditBill}>
								Edit Bill
							</Button>

							<Button variant='text' onClick={handleNewBill}>
								New Bill
							</Button>

							<Button variant='contained' onClick={handleDownloadPdf}>
								Download PDF
							</Button>
						</Stack>
					</Box>
				)}
				<Dialog
					open={newItemModalOpen}
					onClose={() => setNewItemModalOpen(false)}
					fullWidth
					maxWidth='sm'
				>
					<DialogTitle>Create New Item</DialogTitle>

					<DialogContent>
						<ProductForm onSuccess={handleNewItemCreated} />
					</DialogContent>
				</Dialog>
			</Container>
		</AppShell>
	);
}
