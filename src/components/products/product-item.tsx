import {
	Box,
	Chip,
	IconButton,
	Menu,
	MenuItem,
	Stack,
	Typography,
} from "@mui/material";
import { useState } from "react";
import type { Product } from "@/types/product";
import { MoreVertOutlined } from "@mui/icons-material";

interface ProductItemProps {
	product: Product;
	onEdit: (product: Product) => void;
	onDelete: (product: Product) => void;
}
export default function ProductItem({
	product,
	onEdit,
	onDelete,
}: ProductItemProps) {
	const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
	const menuOpen = Boolean(menuAnchor);

	return (
		<Box
			sx={{
				width: "100%",
				minWidth: 0,
				px: { xs: 2, sm: 2.5 },
				py: 1.75,
				borderBottom: "1px solid",
				borderColor: "divider",
				boxSizing: "border-box",
				transition: "background-color 0.15s ease-in-out",
				"&:hover": { bgcolor: "rgba(15, 23, 42, 0.018)" },
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
					spacing: 2,
				}}
			>
				<Stack
					direction={{ xs: "column", sm: "row" }}
					spacing={{ xs: 0.5, sm: 3 }}
					sx={{
						width: 0,
						minWidth: 0,
						flex: 1,
						alignItems: {
							xs: "stretch",
							sm: "center",
						},
					}}
				>
					<Box sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
						<Typography
							sx={{
								fontWeight: 600,
								fontSize: "0.925rem",
								overflow: "hidden",
								whiteSpace: "nowrap",
								textOverflow: "ellipsis",
							}}
						>
							{product.name}
						</Typography>

						<Typography
							variant='body2'
							color='text.secondary'
							sx={{
								display: { xs: "block", sm: "none" },
								fontSize: "0.75rem",
							}}
						>
							{product.type} · {product.category}
						</Typography>
					</Box>
					<Chip
						label={product.type === "product" ? "Product" : "Service"}
						size='small'
						sx={{
							display: { xs: "none", sm: "inline-flex" },
							fontWeight: 600,
							fontSize: "0.72rem",
							bgcolor: product.type === "product" ? "#F1F5F9" : "#EFF6FF",
							color: product.type === "product" ? "#475569" : "#1D4ED8",
							border: "1px solid",
							borderColor: product.type === "product" ? "#E2E8F0" : "#BFDBFE",
						}}
					/>
					<Typography
						variant='body2'
						color='text.secondary'
						sx={{
							minWidth: 120,
							display: { xs: "none", sm: "block" },
							fontSize: "0.85rem",
						}}
					>
						{product.category}
					</Typography>
					<Typography
						sx={{
							fontWeight: 700,
							fontSize: "0.95rem",
							minWidth: { sm: 100 },
							textAlign: { sm: "right" },
						}}
					>
						₹{product.mrp.toLocaleString("en-IN")}
					</Typography>
				</Stack>
				<IconButton
					size='small'
					aria-label={`Actions for ${product.name}`}
					onClick={(event) => {
						setMenuAnchor(event.currentTarget);
					}}
					sx={{
						"&:hover": { bgcolor: "rgba(15, 23, 42, 0.06)" },
					}}
				>
					<MoreVertOutlined fontSize='small' />
				</IconButton>
				<Menu
					anchorEl={menuAnchor}
					open={menuOpen}
					onClose={() => {
						setMenuAnchor(null);
					}}
				>
					<MenuItem
						onClick={() => {
							setMenuAnchor(null);
							onEdit(product);
						}}
					>
						Edit
					</MenuItem>

					<MenuItem
						onClick={() => {
							setMenuAnchor(null);
							onDelete(product);
						}}
						sx={{
							color: "error.main",
						}}
					>
						Delete
					</MenuItem>
				</Menu>
			</Stack>
		</Box>
	);
}
