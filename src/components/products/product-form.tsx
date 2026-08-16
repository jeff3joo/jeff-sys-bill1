"use client";

import { useState } from "react";
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
} from "@mui/material";
import { z } from "zod";
import { PRODUCT_CATEGORIES } from "@/lib/products/categories";


const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required"),

  type: z.enum(["product", "service"]),

  category: z
    .string()
    .min(1, "Category is required"),

  mrp: z
    .number({
      message: "MRP is required",
    })
    .min(0, "MRP cannot be negative"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSuccess?: () => void;
}

export default function ProductForm({
  onSuccess,
}: ProductFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      type: "product",
      category: "",
      mrp: 0,
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    console.log(data);

    setLoading(true);

    try {
      // Supabase insert will be added next.
      reset();
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: "100%" }}
    >
      <Stack spacing={3}>
        <Controller
          name="type"
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
              <ToggleButton value="product">
                Product
              </ToggleButton>

              <ToggleButton value="service">
                Service
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        />

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Product / Service Name"
              placeholder="e.g. HP 15 Laptop"
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Category"
              error={!!errors.category}
              helperText={errors.category?.message}
              fullWidth
            >
              {PRODUCT_CATEGORIES.map((category) => (
                <MenuItem
                  key={category}
                  value={category}
                >
                  {category}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="mrp"
          control={control}
          render={({ field }) => (
            <TextField
              label="MRP"
              type="number"
              value={field.value}
              onChange={(event) => {
                field.onChange(
                  event.target.value === ""
                    ? 0
                    : Number(event.target.value)
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
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Item"}
        </Button>
      </Stack>
    </Box>
  );
}