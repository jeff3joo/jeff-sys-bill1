import { Button, Card, CardContent, CircularProgress, Stack, Typography } from "@mui/material";
import BillItem, { type Bill } from "./bill-item";

interface BillListProps {
	loading: boolean;
	error: boolean;
	bills: Bill[];
	hasFilters: boolean;
	onRetry: () => void;
	onEdit: (bill: Bill) => void;
	onDownloadPdf: (bill: Bill) => void;
	onDelete: (bill: Bill) => void;
}

export default function BillList({
	loading,
	error,
	bills,
	hasFilters,
	onRetry,
	onEdit,
	onDownloadPdf,
	onDelete,
}: BillListProps) {
	return (
		<Card>
			<BoxHeader />
			<CardContent>
				{loading && <ListMessage><CircularProgress size={28} /><Typography variant='body2' color='text.secondary'>Loading bills...</Typography></ListMessage>}
				{!loading && error && <ListMessage><Typography variant='h6' sx={{ fontWeight: 600 }}>Couldn&apos;t load bills</Typography><Button variant='outlined' onClick={onRetry}>Try Again</Button></ListMessage>}
				{!loading && !error && bills.length === 0 && <ListMessage><Typography variant='h6' sx={{ fontWeight: 600 }}>{hasFilters ? "No matching bills found" : "No bills generated yet"}</Typography></ListMessage>}
				{!loading && !error && bills.length > 0 && <Stack>{bills.map((bill) => <BillItem key={bill.id} bill={bill} onEdit={onEdit} onDownloadPdf={onDownloadPdf} onDelete={onDelete} />)}</Stack>}
			</CardContent>
		</Card>
	);
}

function BoxHeader() {
	return <Stack direction='row' sx={{ display: { xs: "none", sm: "flex" }, px: 2.5, py: 1.5, borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.default" }}><Typography variant='caption' color='text.secondary' sx={{ flex: 1 }}>INVOICE / CUSTOMER</Typography><Typography variant='caption' color='text.secondary' sx={{ width: 360 }}>DATE / TOTAL</Typography><Stack direction='row' sx={{ width: 136 }}><Typography variant='caption' color='text.secondary'>ACTIONS</Typography></Stack></Stack>;
}

function ListMessage({ children }: { children: React.ReactNode }) {
	return <Stack spacing={2} sx={{ minHeight: 240, alignItems: "center", justifyContent: "center", textAlign: "center", px: 2 }}>{children}</Stack>;
}