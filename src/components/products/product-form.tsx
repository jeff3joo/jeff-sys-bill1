"use client";

import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Box,
	Button,
	MenuItem,
	Stack,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Alert,
} from "@mui/material";
import { z } from "zod";
import { PRODUCT_CATEGORIES } from "@/lib/products/categories";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/types/product";

const productSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),

	type: z.enum(["product", "service"]),

	category: z.string().min(1, "Category is required"),

	mrp: z.preprocess(
		(value) => {
			if (value === "") {
				return undefined;
			}

			return Number(value);
		},
		z
			.number({
				message: "MRP is required",
			})
			.min(0, "MRP cannot be negative"),
	),
});

type ProductFormInput = z.input<typeof productSchema>;
type ProductFormOutput = z.output<typeof productSchema>;

interface ProductFormProps {
	product?: Product;
	onSuccess?: () => void;
}

export default function ProductForm({ product, onSuccess }: ProductFormProps) {
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ProductFormInput, unknown, ProductFormOutput>({
		resolver: zodResolver(productSchema),
		defaultValues: {
			name: "",
			type: "product",
			category: "",
			mrp: "",
		},
	});

	useEffect(() => {
		if (product) {
			reset({
				name: product.name,
				type: product.type,
				category: product.category,
				mrp: product.mrp,
			});
		} else {
			reset({
				name: "",
				type: "product",
				category: "",
				mrp: "",
			});
		}
	}, [product, reset]);

	const onSubmit = async (data: ProductFormOutput) => {
		setLoading(true);
		setErrorMessage("");

		try {
			const supabase = createClient();
			let error;

			if (product) {
				const result = await supabase
					.from("products")
					.update({
						name: data.name,
						type: data.type,
						category: data.category,
						mrp: data.mrp,
						updated_at: new Date().toISOString(),
					})
					.eq("id", product.id);

				error = result.error;
			} else {
				const result = await supabase.from("products").insert({
					name: data.name,
					type: data.type,
					category: data.category,
					mrp: data.mrp,
				});

				error = result.error;
			}
			if (error) {
				console.error("Failed to save product:", error);
				setErrorMessage("Unable to save the item. Please try again.");
				return;
			}

			reset();
			onSuccess?.();
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			component='form'
			onSubmit={handleSubmit(onSubmit)}
			sx={{ width: "100%" }}
		>
			<Stack spacing={3}>
				{errorMessage && <Alert severity='error'>{errorMessage}</Alert>}
				<Controller
					name='type'
					control={control}
					render={({ field }) => (
						<ToggleButtonGroup
							exclusive
							value={field.value}
							onChange={(_, value) => {
								if (value) {
									field.onChange(value);
								}
							}}
							fullWidth
						>
							<ToggleButton value='product'>Product</ToggleButton>

							<ToggleButton value='service'>Service</ToggleButton>
						</ToggleButtonGroup>
					)}
				/>

				<Controller
					name='name'
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label='Product / Service Name'
							placeholder='e.g. HP 15 Laptop'
							error={!!errors.name}
							helperText={errors.name?.message}
							fullWidth
						/>
					)}
				/>

				<Controller
					name='category'
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							select
							label='Category'
							error={!!errors.category}
							helperText={errors.category?.message}
							fullWidth
						>
							{PRODUCT_CATEGORIES.map((category) => (
								<MenuItem key={category} value={category}>
									{category}
								</MenuItem>
							))}
						</TextField>
					)}
				/>

				<Controller
					name='mrp'
					control={control}
					render={({ field }) => (
						<TextField
							label='MRP'
							type='number'
							value={field.value}
							onChange={(event) => {
								field.onChange(
									event.target.value === "" ? "" : Number(event.target.value),
								);
							}}
							error={!!errors.mrp}
							helperText={errors.mrp?.message}
							slotProps={{
								htmlInput: {
									min: 0,
									step: 0.01,
								},
							}}
							fullWidth
						/>
					)}
				/>

				<Button
					type='submit'
					variant='contained'
					size='large'
					disabled={loading}
				>
					{loading ? "Saving..." : product ? "Update Item" : "Save Item"}
				</Button>
			</Stack>
		</Box>
	);
}
