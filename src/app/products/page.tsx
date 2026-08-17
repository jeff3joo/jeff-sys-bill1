"use client";

import {
	Box,
	Card,
	Stack,
	Button,
	TextField,
	Typography,
	CardContent,
	DialogTitle,
	DialogActions,
	DialogContent,
	InputAdornment,
	DialogContentText,
	Dialog,
	CircularProgress,
} from "@mui/material";

import {
	AddOutlined,
	Inventory2Outlined,
	SearchOutlined,
} from "@mui/icons-material";

import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import AppShell from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/client";
import { getProducts } from "@/lib/products/product-service";
import ProductForm from "@/components/products/product-form";
import ProductItem from "@/components/products/product-item";

export default function ProductsPage() {
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [actionError, setActionError] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [products, setProducts] = useState<Product[]>([]);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

	const filteredProducts = products.filter((product) => {
		const query = searchQuery.trim().toLowerCase();

		if (!query) {
			return true;
		}

		return (
			product.name.toLowerCase().includes(query) ||
			product.category.toLowerCase().includes(query) ||
			product.type.toLowerCase().includes(query)
		);
	});

	const handleEdit = (product: Product) => {
		setEditingProduct(product);
		setShowForm(true);
	};

	const handleDelete = async () => {
		if (!deletingProduct) {
			return;
		}
		setActionError("");
		setDeleteLoading(true);

		try {
			const supabase = createClient();

			const { error } = await supabase
				.from("products")
				.delete()
				.eq("id", deletingProduct.id);

			if (error) {
				console.error("Failed to delete product:", error);
				setActionError("Unable to delete the item. Please try again.");

				return;
			}

			setProducts((currentProducts) =>
				currentProducts.filter((product) => product.id !== deletingProduct.id),
			);

			setDeletingProduct(null);
		} finally {
			setDeleteLoading(false);
		}
	};

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

	useEffect(() => {
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

				<TextField
					value={searchQuery}
					onChange={(event) => {
						setSearchQuery(event.target.value);
					}}
					placeholder='Search products or services...'
					fullWidth
					slotProps={{
						input: {
							startAdornment: (
								<InputAdornment position='start'>
									<SearchOutlined />
								</InputAdornment>
							),
						},
					}}
				/>

				{showForm && (
					<Card>
						<CardContent>
							<Stack spacing={3}>
								<Box>
									<Typography variant='h6' sx={{ fontWeight: 700 }}>
										{editingProduct
											? "Edit Product or Service"
											: "Add Product or Service"}
									</Typography>
									<Typography variant='body2' color='text.secondary'>
										{editingProduct
											? "Update the details of this item."
											: "Add an item that can later be used while creating a bill."}
									</Typography>
								</Box>
								<ProductForm
									product={editingProduct ?? undefined}
									onSuccess={async () => {
										setShowForm(false);
										setEditingProduct(null);
										await loadProducts();
									}}
								/>
							</Stack>
						</CardContent>
					</Card>
				)}

				<Card>
					<Box
						sx={{
							display: { xs: "none", sm: "flex" },
							px: 2.5,
							py: 1.5,
							borderBottom: "1px solid",
							borderColor: "divider",
							bgcolor: "background.default",
						}}
					>
						<Typography
							variant='caption'
							color='text.secondary'
							sx={{ flex: 1 }}
						>
							ITEM
						</Typography>

						<Typography
							variant='caption'
							color='text.secondary'
							sx={{ width: 120 }}
						>
							CATEGORY
						</Typography>

						<Typography
							variant='caption'
							color='text.secondary'
							sx={{ width: 100, textAlign: "right" }}
						>
							MRP
						</Typography>

						<Box sx={{ width: 40 }} />
					</Box>
					<CardContent>
						{loading && (
							<Stack
								spacing={2}
								sx={{
									minHeight: 240,
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<CircularProgress size={28} />

								<Typography variant='body2' color='text.secondary'>
									Loading products...
								</Typography>
							</Stack>
						)}
						{!loading && errorMessage && (
							<Stack
								spacing={2}
								sx={{
									minHeight: 240,
									alignItems: "center",
									justifyContent: "center",
									textAlign: "center",
									px: 2,
								}}
							>
								<Typography variant='h6' sx={{ fontWeight: 600 }}>
									Couldn't load products
								</Typography>

								<Typography variant='body2' color='text.secondary'>
									{errorMessage}
								</Typography>

								<Button variant='outlined' onClick={loadProducts}>
									Try Again
								</Button>
							</Stack>
						)}

						{!loading && !errorMessage && (
							<Box>
								{products.length === 0 ? (
									<Stack
										spacing={1}
										sx={{
											minHeight: 240,
											alignItems: "center",
											justifyContent: "center",
											textAlign: "center",
											px: 2,
										}}
									>
										<Typography variant='h6' sx={{ fontWeight: 600 }}>
											No products or services yet
										</Typography>

										<Typography variant='body2' color='text.secondary'>
											Add your first item to start creating bills.
										</Typography>
									</Stack>
								) : filteredProducts.length === 0 ? (
									<Stack
										spacing={1}
										sx={{
											minHeight: 200,
											alignItems: "center",
											justifyContent: "center",
											textAlign: "center",
											px: 2,
										}}
									>
										<Typography variant='h6' sx={{ fontWeight: 600 }}>
											No matching items
										</Typography>

										<Typography variant='body2' color='text.secondary'>
											Try a different product name, category, or service.
										</Typography>
									</Stack>
								) : (
									<Stack>
										{filteredProducts.map((product) => (
											<ProductItem
												key={product.id}
												product={product}
												onEdit={handleEdit}
												onDelete={(product) => {
													setDeletingProduct(product);
												}}
											/>
										))}
									</Stack>
								)}
							</Box>
						)}
					</CardContent>
				</Card>
			</Stack>
			<Dialog
				open={Boolean(deletingProduct)}
				onClose={() => {
					if (!deleteLoading) {
						setDeletingProduct(null);
					}
				}}
				fullWidth
				maxWidth='xs'
			>
				<DialogTitle>Delete {deletingProduct?.name}?</DialogTitle>

				<DialogContent>
					<DialogContentText>
						This item will be removed from your products and services catalog.
						You won't be able to use it when creating new bills.
					</DialogContentText>
					{actionError && (
						<Typography variant='body2' color='error' sx={{ mt: 2 }}>
							{actionError}
						</Typography>
					)}
				</DialogContent>

				<DialogActions>
					<Button
						onClick={() => {
							setDeletingProduct(null);
						}}
						disabled={deleteLoading}
					>
						Cancel
					</Button>

					<Button
						onClick={handleDelete}
						color='error'
						variant='contained'
						disabled={deleteLoading}
					>
						{deleteLoading ? "Deleting..." : "Delete"}
					</Button>
				</DialogActions>
			</Dialog>
		</AppShell>
	);
}
