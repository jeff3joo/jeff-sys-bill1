import {
	Box,
	IconButton,
	Stack,
	Typography,
} from "@mui/material";
import {
	DeleteOutlined,
	DownloadOutlined,
	EditOutlined,
} from "@mui/icons-material";

export interface Bill {
	id: string;
	invoiceNumber: string;
	customerName: string;
	invoiceDate: string;
	grandTotal: number;
}

interface BillItemProps {
	bill: Bill;
	onEdit: (bill: Bill) => void;
	onDownloadPdf: (bill: Bill) => void;
	onDelete: (bill: Bill) => void;
}

export default function BillItem({
	bill,
	onEdit,
	onDownloadPdf,
	onDelete,
}: BillItemProps) {
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
				"&:last-child": { borderBottom: "none" },
			}}
		>
			<Stack
				direction={{ xs: "column", md: "row" }}
				spacing={{ xs: 1.5, md: 2 }}
				sx={{ alignItems: { md: "center" } }}
			>
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography sx={{ fontWeight: 600 }} noWrap>
						{bill.invoiceNumber}
					</Typography>
					<Typography variant='body2' color='text.secondary' noWrap>
						{bill.customerName}
					</Typography>
				</Box>

				<Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0.5, sm: 3 }} sx={{ width: { md: 360 } }}>
					<Box sx={{ minWidth: { sm: 120 } }}>
						<Typography variant='caption' color='text.secondary' sx={{ display: { sm: "none" } }}>
							Invoice Date
						</Typography>
						<Typography variant='body2'>{bill.invoiceDate}</Typography>
					</Box>
					<Box sx={{ minWidth: { sm: 120 }, textAlign: { sm: "right" } }}>
						<Typography variant='caption' color='text.secondary' sx={{ display: { sm: "none" } }}>
							Grand Total
						</Typography>
						<Typography sx={{ fontWeight: 600 }}>₹{bill.grandTotal.toLocaleString("en-IN")}</Typography>
					</Box>
				</Stack>

				<Stack direction='row' spacing={0.5} sx={{ alignSelf: { xs: "flex-end", md: "auto" } }}>
					<IconButton aria-label={`Edit ${bill.invoiceNumber}`} onClick={() => onEdit(bill)}>
						<EditOutlined />
					</IconButton>
					<IconButton aria-label={`Download PDF for ${bill.invoiceNumber}`} onClick={() => onDownloadPdf(bill)}>
						<DownloadOutlined />
					</IconButton>
					<IconButton aria-label={`Delete ${bill.invoiceNumber}`} color='error' onClick={() => onDelete(bill)}>
						<DeleteOutlined />
					</IconButton>
				</Stack>
			</Stack>
		</Box>
	);
}