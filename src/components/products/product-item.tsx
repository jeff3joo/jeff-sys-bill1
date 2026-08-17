import {
	Box,
	Chip,
	IconButton,
	Menu,
	MenuItem,
	Stack,
	Typography,
} from "@mui/material";
import { MoreVertOutlined } from "@mui/icons-material";
import { useState } from "react";
import type { Product } from "@/types/product";

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
				py: 2,
				borderBottom: "1px solid",
				borderColor: "divider",
				boxSizing: "border-box",
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
							}}
						>
							{product.type} · {product.category}
						</Typography>
					</Box>
					<Chip
						label={product.type === "product" ? "Product" : "Service"}
						size='small'
						variant='outlined'
						sx={{
							display: { xs: "none", sm: "inline-flex" },
						}}
					/>
					<Typography
						variant='body2'
						color='text.secondary'
						sx={{
							minWidth: 120,
							display: { xs: "none", sm: "block" },
						}}
					>
						{product.category}
					</Typography>
					<Typography
						sx={{
							fontWeight: 600,
							minWidth: { sm: 100 },
							textAlign: { sm: "right" },
						}}
					>
						₹{product.mrp.toLocaleString("en-IN")}
					</Typography>
				</Stack>
				<IconButton
					aria-label={`Actions for ${product.name}`}
					onClick={(event) => {
						setMenuAnchor(event.currentTarget);
					}}
				>
					<MoreVertOutlined />
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
