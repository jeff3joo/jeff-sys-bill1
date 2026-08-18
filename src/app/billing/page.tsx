"use client";

import {
	Box,
	Button,
	Card,
	CardContent,
	Container,
	Divider,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import { getProducts } from "@/lib/products/product-service";

type BillItem = {
	productId: string;
	name: string;
	type: "product" | "service";
	category: string;
	mrp: number;
	quantity: number;
	sellingPrice: number;
};

export default function BillingPage() {
	const [customerName, setCustomerName] = useState("");
	const [customerPhone, setCustomerPhone] = useState("");
	const [customerEmail, setCustomerEmail] = useState("");
	const [customerAddress, setCustomerAddress] = useState("");
	const [customerNameError, setCustomerNameError] = useState("");

	const [searchQuery, setSearchQuery] = useState("");
	const [products, setProducts] = useState<Product[]>([]);
	const [billItems, setBillItems] = useState<BillItem[]>([]);
	const [productsLoading, setProductsLoading] = useState(false);

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

	const validateCustomerDetails = () => {
		if (!customerName.trim()) {
			setCustomerNameError("Customer name is required.");
			return false;
		}

		setCustomerNameError("");
		return true;
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
					productId: product.id,
					name: product.name,
					type: product.type,
					category: product.category,
					mrp: product.mrp,
					quantity: 1,
					sellingPrice: product.mrp,
				},
			];
		});

		setSearchQuery("");
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
							New Bill
						</Typography>

						<Typography variant='body1' color='text.secondary'>
							Create a new invoice for your customer.
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
										Enter the customer's information.
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
										onChange={(event) => setCustomerAddress(event.target.value)}
									/>{" "}
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
								<Box
									sx={{
										position: "relative",
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
												overflow: "visible",
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
												key={item.productId}
												sx={{
													p: 2,
													border: "1px solid",
													borderColor: "divider",
													borderRadius: 2,
												}}
											>
												<Stack
													direction='row'
													sx={{
														justifyContent: "space-between",
														alignItems: "center",
														gap: 2,
													}}
												>
													<Box sx={{ minWidth: 0 }}>
														<Typography sx={{ fontWeight: 600 }}>
															{item.name}
														</Typography>

														<Typography variant='body2' color='text.secondary'>
															MRP ₹{item.mrp.toLocaleString("en-IN")}
															{" · "}
															Qty {item.quantity}
														</Typography>
													</Box>

													<Typography
														sx={{
															fontWeight: 600,
															whiteSpace: "nowrap",
														}}
													>
														₹{item.sellingPrice.toLocaleString("en-IN")}
													</Typography>
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

									<Typography>₹0.00</Typography>
								</Stack>

								<Stack
									direction='row'
									sx={{
										justifyContent: "space-between",
									}}
								>
									<Typography color='text.secondary'>Discount</Typography>

									<Typography>₹0.00</Typography>
								</Stack>

								<Divider />

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
										₹0.00
									</Typography>
								</Stack>

								<Button
									variant='contained'
									size='large'
									fullWidth
									onClick={() => {
										if (!validateCustomerDetails()) {
											return;
										}

										console.log({
											customerName,
											customerPhone,
											customerEmail,
											customerAddress,
										});
									}}
								>
									Generate Bill
								</Button>
							</Stack>
						</CardContent>
					</Card>
				</Stack>
			</Container>
		</AppShell>
	);
}
