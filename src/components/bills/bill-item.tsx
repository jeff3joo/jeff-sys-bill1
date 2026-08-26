import {
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Menu,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import {
	DeleteOutlined,
	DownloadOutlined,
	EditOutlined,
	ArrowDropDownOutlined,
} from "@mui/icons-material";
import { useState } from "react";
import { updatePaymentStatus } from "@/app/bills/actions";
import type { PaymentStatus } from "@/types/billing";

export interface Bill {
	id: string;
	invoiceNumber: string;
	customerName: string;
	invoiceDate: string;
	grandTotal: number;
	paymentStatus: "not_paid" | "partially_paid" | "fully_paid";
	amountReceived: number;
	amountPending: number;
}

interface BillItemProps {
	bill: Bill;
	downloadLoading?: boolean;
	actionsDisabled?: boolean;
	onEdit: (bill: Bill) => void;
	onDownloadPdf: (bill: Bill) => void;
	onDelete: (bill: Bill) => void;
	onPaymentUpdated: () => void;
}

const paymentStatusLabels: Record<PaymentStatus, string> = {
	not_paid: "Not Paid",
	partially_paid: "Partially Paid",
	fully_paid: "Fully Paid",
};

export default function BillItem({
	bill,
	downloadLoading = false,
	actionsDisabled = false,
	onEdit,
	onDownloadPdf,
	onDelete,
	onPaymentUpdated,
}: BillItemProps) {
	const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
	const [dialogStatus, setDialogStatus] = useState<PaymentStatus | null>(null);
	const [addAmount, setAddAmount] = useState("");
	const [paymentError, setPaymentError] = useState("");
	const [paymentLoading, setPaymentLoading] = useState(false);
	const numericAddAmount = Number(addAmount);
	const newAmountReceived =
		bill.amountReceived +
		(Number.isFinite(numericAddAmount) ? numericAddAmount : 0);
	const newAmountPending = Math.max(bill.grandTotal - newAmountReceived, 0);

	const closePaymentDialog = () => {
		if (paymentLoading) {
			return;
		}

		setDialogStatus(null);
		setAddAmount("");
		setPaymentError("");
	};

	const openPaymentDialog = (status: PaymentStatus) => {
		setMenuAnchor(null);

		if (status === bill.paymentStatus && status !== "partially_paid") {
			return;
		}

		setPaymentError("");
		setAddAmount("");
		setDialogStatus(status);
	};

	const confirmPaymentUpdate = async () => {
		if (!dialogStatus || paymentLoading) {
			return;
		}

		let nextStatus = dialogStatus;
		let amountReceived = 0;
		let amountPending = bill.grandTotal;

		if (dialogStatus === "fully_paid") {
			amountReceived = bill.grandTotal;
			amountPending = 0;
		}

		if (dialogStatus === "partially_paid") {
			if (!Number.isFinite(numericAddAmount) || numericAddAmount <= 0) {
				setPaymentError("Add Paid Amount must be greater than 0.");
				return;
			}

			if (newAmountReceived > bill.grandTotal) {
				setPaymentError(
					"The new amount received cannot exceed the bill total.",
				);
				return;
			}

			amountReceived = newAmountReceived;
			amountPending = newAmountPending;
			nextStatus = amountPending === 0 ? "fully_paid" : "partially_paid";
		}

		setPaymentLoading(true);
		setPaymentError("");

		try {
			await updatePaymentStatus(bill.id, {
				paymentStatus: nextStatus,
				amountReceived,
				amountPending,
			});
			setDialogStatus(null);
			setAddAmount("");
			onPaymentUpdated();
		} catch (error) {
			console.error("Failed to update payment status:", error);
			setPaymentError("Unable to update payment status. Please try again.");
		} finally {
			setPaymentLoading(false);
		}
	};

	const dialogTitle =
		dialogStatus === "partially_paid"
			? "Add Payment"
			: "Confirm Payment Status";
	const dialogDescription =
		dialogStatus === "fully_paid"
			? "Mark this bill as fully paid?"
			: dialogStatus === "not_paid"
				? "Mark this bill as not paid?"
				: "Enter the additional amount received.";

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

				<Stack
					direction={{ xs: "column", sm: "row" }}
					spacing={{ xs: 0.5, sm: 3 }}
					sx={{ width: { md: 400 } }}
				>
					<Box sx={{ minWidth: { sm: 120 } }}>
						<Typography
							variant='caption'
							color='text.secondary'
							sx={{ display: { sm: "none" } }}
						>
							Invoice Date
						</Typography>
						<Typography variant='body2'>{bill.invoiceDate}</Typography>
					</Box>
					<Box sx={{ minWidth: { sm: 120 }, textAlign: { sm: "right" } }}>
						<Typography
							variant='caption'
							color='text.secondary'
							sx={{ display: { sm: "none" } }}
						>
							Grand Total
						</Typography>
						<Typography sx={{ fontWeight: 600 }}>
							₹{bill.grandTotal.toLocaleString("en-IN")}
						</Typography>
					</Box>
					<Box sx={{ minWidth: { sm: 140 } }}>
						<Typography
							variant='caption'
							color='text.secondary'
							sx={{ display: { sm: "none" } }}
						>
							Payment Status
						</Typography>
						<Chip
							label={paymentStatusLabels[bill.paymentStatus]}
							deleteIcon={<ArrowDropDownOutlined />}
							onClick={(event) => setMenuAnchor(event.currentTarget)}
							onDelete={(event) => setMenuAnchor(event.currentTarget)}
							color={
								bill.paymentStatus === "fully_paid"
									? "success"
									: bill.paymentStatus === "partially_paid"
										? "warning"
										: "default"
							}
							variant='outlined'
							aria-label={`Payment status: ${paymentStatusLabels[bill.paymentStatus]}`}
						/>
						{bill.paymentStatus === "partially_paid" && (
							<Button
								size='small'
								onClick={() => openPaymentDialog("partially_paid")}
								disabled={actionsDisabled}
							>
								Add Payment
							</Button>
						)}
					</Box>
				</Stack>

				<Stack
					direction='row'
					spacing={0.5}
					sx={{ alignSelf: { xs: "flex-end", md: "auto" } }}
				>
					<IconButton
						aria-label={`Edit ${bill.invoiceNumber}`}
						onClick={() => onEdit(bill)}
						disabled={actionsDisabled}
					>
						<EditOutlined />
					</IconButton>
					<IconButton
						aria-label={`Download PDF for ${bill.invoiceNumber}`}
						onClick={() => onDownloadPdf(bill)}
						disabled={downloadLoading || actionsDisabled}
					>
						{downloadLoading ? "..." : <DownloadOutlined />}
					</IconButton>
					<IconButton
						aria-label={`Delete ${bill.invoiceNumber}`}
						color='error'
						onClick={() => onDelete(bill)}
						disabled={actionsDisabled}
					>
						<DeleteOutlined />
					</IconButton>
				</Stack>
			</Stack>
			<Menu
				anchorEl={menuAnchor}
				open={Boolean(menuAnchor)}
				onClose={() => setMenuAnchor(null)}
			>
				{(Object.keys(paymentStatusLabels) as PaymentStatus[]).map((status) => (
					<MenuItem key={status} onClick={() => openPaymentDialog(status)}>
						{paymentStatusLabels[status]}
					</MenuItem>
				))}
			</Menu>
			<Dialog
				open={dialogStatus !== null}
				onClose={closePaymentDialog}
				fullWidth
				maxWidth='xs'
			>
				<DialogTitle>{dialogTitle}</DialogTitle>
				<DialogContent>
					{dialogStatus === "partially_paid" ? (
						<Stack spacing={2} sx={{ pt: 1 }}>
							<Typography>
								Bill Total: ₹
								{bill.grandTotal.toLocaleString("en-IN", {
									minimumFractionDigits: 2,
								})}
							</Typography>
							<Typography>
								Amount Already Received: ₹
								{bill.amountReceived.toLocaleString("en-IN", {
									minimumFractionDigits: 2,
								})}
							</Typography>
							<TextField
								label='Add Paid Amount'
								type='number'
								value={addAmount}
								onChange={(event) => {
									setAddAmount(event.target.value);
									setPaymentError("");
								}}
								error={Boolean(paymentError)}
								helperText={paymentError || "Enter an additional payment."}
								slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
							/>
							<Typography>
								New Amount Received: ₹
								{newAmountReceived.toLocaleString("en-IN", {
									minimumFractionDigits: 2,
								})}
							</Typography>
							<Typography>
								New Amount Pending: ₹
								{newAmountPending.toLocaleString("en-IN", {
									minimumFractionDigits: 2,
								})}
							</Typography>
						</Stack>
					) : (
						<Typography sx={{ pt: 1 }}>{dialogDescription}</Typography>
					)}
					{dialogStatus !== "partially_paid" && paymentError && (
						<Typography color='error' sx={{ mt: 2 }}>
							{paymentError}
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={closePaymentDialog} disabled={paymentLoading}>
						Cancel
					</Button>
					<Button
						onClick={() => void confirmPaymentUpdate()}
						variant='contained'
						disabled={paymentLoading}
					>
						{paymentLoading ? "Saving..." : "Confirm"}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
