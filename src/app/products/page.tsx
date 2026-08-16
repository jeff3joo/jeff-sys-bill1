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
import { useState } from "react";

import AppShell from "@/components/layout/app-shell";
import ProductForm from "@/components/products/product-form";

export default function ProductsPage() {
	const [showForm, setShowForm] = useState(false);

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
						<Stack
							spacing={2}
							sx={{
								minHeight: 240,
								textAlign: "center",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							{" "}
							<Inventory2Outlined
								sx={{
									fontSize: 48,
									color: "text.secondary",
								}}
							/>
							<Typography variant='h6' sx={{ fontWeight: 600 }}>
								No products displayed yet
							</Typography>
							<Typography variant='body2' color='text.secondary'>
								The product list will be connected to Supabase next.
							</Typography>
						</Stack>
					</CardContent>
				</Card>
			</Stack>
		</AppShell>
	);
}
