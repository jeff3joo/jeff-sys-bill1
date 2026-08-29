import {
	Button,
	Card,
	CardContent,
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
		<Card>
			<BoxHeader isQuotation={isQuotation} />
			<CardContent>
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
						<Typography variant='h6' sx={{ fontWeight: 600 }}>
							{isQuotation
								? "Couldn't load quotations"
								: "Couldn't load bills"}
						</Typography>
						<Button variant='outlined' onClick={onRetry}>
							Try Again
						</Button>
					</ListMessage>
				)}
				{!loading && !error && bills.length === 0 && (
					<ListMessage>
						<Typography variant='h6' sx={{ fontWeight: 600 }}>
							{hasFilters
								? isQuotation
									? "No matching quotations found"
									: "No matching bills found"
								: isQuotation
									? "No quotations generated yet"
									: "No bills generated yet"}
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
			</CardContent>
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
				py: 1.5,
				borderBottom: "1px solid",
				borderColor: "divider",
				bgcolor: "background.default",
			}}
		>
			<Typography variant='caption' color='text.secondary' sx={{ flex: 1 }}>
				{isQuotation ? "QUOTATION / CUSTOMER" : "INVOICE / CUSTOMER"}
			</Typography>
			<Typography
				variant='caption'
				color='text.secondary'
				sx={{ width: isQuotation ? 260 : 400 }}
			>
				DATE / TOTAL
			</Typography>
			<Stack direction='row' sx={{ width: 136 }}>
				<Typography variant='caption' color='text.secondary'>
					ACTIONS
				</Typography>
			</Stack>
		</Stack>
	);
}

function ListMessage({ children }: { children: React.ReactNode }) {
	return (
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
			{children}
		</Stack>
	);
}
