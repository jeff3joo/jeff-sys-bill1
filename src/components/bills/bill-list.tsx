import {
	Box,
	Button,
	Card,
	CircularProgress,
	Stack,
	Typography,
} from "@mui/material";
import type { DocumentType } from "@/types/billing";
import BillItem, { type Bill } from "./bill-item";

interface BillListProps {
	loading: boolean;
	error: boolean;
	bills: Bill[];
	hasFilters: boolean;
	documentType?: DocumentType;
	downloadingBillId?: string | null;
	deletingBillId?: string | null;
	onRetry: () => void;
	onEdit: (bill: Bill) => void;
	onDownloadPdf: (bill: Bill) => void;
	onDelete: (bill: Bill) => void;
	onPaymentUpdated: () => void;
}

export default function BillList({
	loading,
	error,
	bills,
	hasFilters,
	documentType = "bill",
	downloadingBillId = null,
	deletingBillId = null,
	onRetry,
	onEdit,
	onDownloadPdf,
	onDelete,
	onPaymentUpdated,
}: BillListProps) {
	const isQuotation = documentType === "quotation";

	return (
		<Card sx={{ overflow: "hidden" }}>
			<BoxHeader isQuotation={isQuotation} />
			<Box>
				{loading && (
					<ListMessage>
						<CircularProgress size={28} />
						<Typography variant='body2' color='text.secondary'>
							{isQuotation ? "Loading quotations..." : "Loading bills..."}
						</Typography>
					</ListMessage>
				)}
				{!loading && error && (
					<ListMessage>
						<Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
							{isQuotation
								? "Couldn't load quotations"
								: "Couldn't load bills"}
						</Typography>
						<Typography variant='body2' color='text.secondary'>
							There was an issue retrieving the records.
						</Typography>
						<Button variant='outlined' size='small' onClick={onRetry}>
							Try Again
						</Button>
					</ListMessage>
				)}
				{!loading && !error && bills.length === 0 && (
					<ListMessage>
						<Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
							{hasFilters
								? isQuotation
									? "No matching quotations found"
									: "No matching bills found"
								: isQuotation
									? "No quotations generated yet"
									: "No bills generated yet"}
						</Typography>
						<Typography variant='body2' color='text.secondary'>
							{hasFilters
								? "Try adjusting your search query or date/status filters."
								: isQuotation
									? "Create your first quotation from the button above."
									: "Create your first bill from the button above."}
						</Typography>
					</ListMessage>
				)}
				{!loading && !error && bills.length > 0 && (
					<Stack>
						{bills.map((bill) => (
							<BillItem
								key={bill.id}
								bill={bill}
								downloadLoading={downloadingBillId === bill.id}
								actionsDisabled={deletingBillId !== null}
								onEdit={onEdit}
								onDownloadPdf={onDownloadPdf}
								onDelete={onDelete}
								onPaymentUpdated={onPaymentUpdated}
							/>
						))}
					</Stack>
				)}
			</Box>
		</Card>
	);
}

function BoxHeader({ isQuotation }: { isQuotation: boolean }) {
	return (
		<Stack
			direction='row'
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
				{isQuotation ? "QUOTATION / CUSTOMER" : "INVOICE / CUSTOMER"}
			</Typography>
			<Typography
				variant='caption'
				color='text.secondary'
				sx={{
					width: isQuotation ? 260 : 400,
					fontWeight: 700,
					letterSpacing: "0.05em",
					fontSize: "0.72rem",
				}}
			>
				DATE / TOTAL
			</Typography>
			<Stack direction='row' sx={{ width: 136 }}>
				<Typography
					variant='caption'
					color='text.secondary'
					sx={{ fontWeight: 700, letterSpacing: "0.05em", fontSize: "0.72rem" }}
				>
					ACTIONS
				</Typography>
			</Stack>
		</Stack>
	);
}

function ListMessage({ children }: { children: React.ReactNode }) {
	return (
		<Stack
			spacing={1}
			sx={{
				minHeight: 220,
				alignItems: "center",
				justifyContent: "center",
				textAlign: "center",
				p: 4,
			}}
		>
			{children}
		</Stack>
	);
}
