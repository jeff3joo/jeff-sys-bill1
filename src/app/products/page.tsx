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
	Pagination,
} from "@mui/material";

import {
	AddOutlined,
	SearchOutlined,
} from "@mui/icons-material";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/types/product";
import AppShell from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/client";
import { getProductsPaginated } from "@/lib/products/product-service";
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

	const [page, setPage] = useState(1);
	const [totalProducts, setTotalProducts] = useState(0);
	const pageSize = 10;

	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

	const handleEdit = (product: Product) => {
		setEditingProduct(product);
		setShowForm(true);
	};

	const loadProducts = useCallback(async () => {
		setLoading(true);
		setErrorMessage("");

		try {
			const result = await getProductsPaginated(page, pageSize, searchQuery);

			setProducts(result.products);
			setTotalProducts(result.total);
		} catch (error) {
			console.error("Failed to load products:", error);

			setErrorMessage("Unable to load products. Please try again.");
		} finally {
			setLoading(false);
		}
	}, [page, searchQuery]);

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

			setDeletingProduct(null);
			await loadProducts();
		} finally {
			setDeleteLoading(false);
		}
	};

	useEffect(() => {
		let cancelled = false;

		const fetchInitialProducts = async () => {
			setLoading(true);
			setErrorMessage("");

			try {
				const result = await getProductsPaginated(page, pageSize, searchQuery);

				if (!cancelled) {
					setProducts(result.products);
					setTotalProducts(result.total);
				}
			} catch (error) {
				if (!cancelled) {
					console.error("Failed to load products:", error);
					setErrorMessage("Unable to load products. Please try again.");
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		void fetchInitialProducts();

		return () => {
			cancelled = true;
		};
	}, [page, searchQuery]);

	return (
		<AppShell>
			<Stack spacing={{ xs: 2.5, sm: 4 }}>
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
						<Typography
							variant='h4'
							sx={{
								fontSize: { xs: "1.5rem", sm: "2.125rem" },
								fontWeight: 700,
							}}
						>
							Products & Services
						</Typography>

						<Typography color='text.secondary' sx={{ mt: { xs: 0.5, sm: 1 } }}>
							Manage the products and services used for billing.
						</Typography>
					</Box>

					<Button
						variant='contained'
						startIcon={<AddOutlined />}
						onClick={() => setShowForm((value) => !value)}
						sx={{ width: { xs: "100%", sm: "auto" } }}
					>
						Add Item
					</Button>
				</Box>

				<TextField
					value={searchQuery}
					onChange={(event) => {
						setSearchQuery(event.target.value);
						setPage(1);
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
						<CardContent sx={{ p: { xs: 2, sm: 3 } }}>
							<Stack spacing={{ xs: 2, sm: 3 }}>
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
										setPage(1);
									}}
								/>
							</Stack>
						</CardContent>
					</Card>
				)}

				<Card sx={{ overflow: "hidden" }}>
					<Box
						sx={{
							display: { xs: "none", sm: "flex" },
							px: 2.5,
							py: 1.25,
							borderBottom: "1px solid",
							borderColor: "divider",
							bgcolor: "#F8FAFC",
						}}
					>
						<Typography
							variant='caption'
							color='text.secondary'
							sx={{ flex: 1, fontWeight: 700, letterSpacing: "0.05em", fontSize: "0.72rem" }}
						>
							ITEM
						</Typography>

						<Typography
							variant='caption'
							color='text.secondary'
							sx={{ width: 120, fontWeight: 700, letterSpacing: "0.05em", fontSize: "0.72rem" }}
						>
							CATEGORY
						</Typography>

						<Typography
							variant='caption'
							color='text.secondary'
							sx={{ width: 100, textAlign: "right", fontWeight: 700, letterSpacing: "0.05em", fontSize: "0.72rem" }}
						>
							MRP
						</Typography>

						<Box sx={{ width: 40 }} />
					</Box>
					<Box>
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
								spacing={1.5}
								sx={{
									minHeight: 240,
									alignItems: "center",
									justifyContent: "center",
									textAlign: "center",
									px: 2,
								}}
							>
								<Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
									Couldn&apos;t load products
								</Typography>

								<Typography variant='body2' color='text.secondary'>
									{errorMessage}
								</Typography>

								<Button variant='outlined' size='small' onClick={loadProducts}>
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
											p: 4,
										}}
									>
										<Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
											{searchQuery
												? "No matching items"
												: "No products or services yet"}
										</Typography>

										<Typography variant='body2' color='text.secondary'>
											{searchQuery
												? "Try a different product name, category, or service."
												: "Add your first item to start creating bills."}
										</Typography>
									</Stack>
								) : (
									<Stack>
										{products.map((product) => (
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
					</Box>
					{!loading && !errorMessage && totalProducts > pageSize && (
						<Box
							sx={{
								p: 2.5,
								borderTop: "1px solid",
								borderColor: "divider",
								display: "flex",
								justifyContent: "center",
							}}
						>
							<Pagination
								count={Math.ceil(totalProducts / pageSize)}
								page={page}
								onChange={(_, value) => {
									setPage(value);
								}}
							/>
						</Box>
					)}
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
				sx={{
					"& .MuiDialog-paper": {
						m: { xs: 2, sm: 3 },
					},
				}}
			>
				<DialogTitle>Delete {deletingProduct?.name}?</DialogTitle>

				<DialogContent>
					<DialogContentText>
						This item will be removed from your products and services catalog.
						You won&apos;t be able to use it when creating new bills.
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
