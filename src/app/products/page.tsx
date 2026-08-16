"use client";

import { AddOutlined, Inventory2Outlined } from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardContent,
	Stack,
	Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getProducts } from "@/lib/products/product-service";
import type { Product } from "@/types/product";
import AppShell from "@/components/layout/app-shell";
import ProductForm from "@/components/products/product-form";

export default function ProductsPage() {
	const [showForm, setShowForm] = useState(false);
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		const loadProducts = async () => {
			setLoading(true);
			setErrorMessage("");

			try {
				const data = await getProducts();

				setProducts(data);
			} catch (error) {
				console.error("Failed to load products:", error);

				setErrorMessage("Unable to load products. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		loadProducts();
	}, []);

	return (
		<AppShell>
			<Stack spacing={4}>
				<Box
					sx={{
						display: "flex",
						alignItems: {
							xs: "flex-start",
							sm: "center",
						},
						justifyContent: "space-between",
						gap: 2,
						flexDirection: {
							xs: "column",
							sm: "row",
						},
					}}
				>
					<Box>
						<Typography variant='h4' sx={{ fontWeight: 700 }}>
							Products & Services
						</Typography>

						<Typography color='text.secondary' sx={{ mt: 1 }}>
							Manage the products and services used for billing.
						</Typography>
					</Box>

					<Button
						variant='contained'
						startIcon={<AddOutlined />}
						onClick={() => setShowForm((value) => !value)}
					>
						Add Item
					</Button>
				</Box>

				{showForm && (
					<Card>
						<CardContent>
							<Stack spacing={3}>
								<Box>
									<Typography variant='h6' sx={{ fontWeight: 700 }}>
										Add Product or Service
									</Typography>

									<Typography variant='body2' color='text.secondary'>
										Add an item that can later be used while creating a bill.
									</Typography>
								</Box>

								<ProductForm onSuccess={() => setShowForm(false)} />
							</Stack>
						</CardContent>
					</Card>
				)}

				<Card>
					<CardContent>
						{loading && (
							<Typography color='text.secondary'>
								Loading products...
							</Typography>
						)}

						{!loading && errorMessage && (
							<Typography color='error'>{errorMessage}</Typography>
						)}

						{!loading && !errorMessage && (
							<Stack spacing={2}>
								<Typography variant='h6' sx={{ fontWeight: 700 }}>
									Products loaded: {products.length}
								</Typography>

								{products.map((product) => (
									<Box key={product.id}>
										<Typography sx={{ fontWeight: 600 }}>
											{product.name}
										</Typography>

										<Typography variant='body2' color='text.secondary'>
											{product.type} · {product.category} · ₹{product.mrp}
										</Typography>
									</Box>
								))}
							</Stack>
						)}
					</CardContent>
				</Card>
			</Stack>
		</AppShell>
	);
}
