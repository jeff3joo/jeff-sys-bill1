import {
	Checkbox,
	InputAdornment,
	ListItemText,
	MenuItem,
	Select,
	Stack,
	TextField,
} from "@mui/material";
import {
	CalendarTodayOutlined,
	FilterListOutlined,
	SearchOutlined,
} from "@mui/icons-material";
import type { DocumentType, PaymentStatus } from "@/types/billing";

export type BillDateFilter = "all" | "today" | "week" | "month" | "custom";

export interface BillToolbarProps {
	searchQuery: string;
	dateFilter: BillDateFilter;
	fromDate: string;
	toDate: string;
	paymentStatuses: PaymentStatus[];
	documentType?: DocumentType;
	onSearchQueryChange: (value: string) => void;
	onDateFilterChange: (value: BillDateFilter) => void;
	onFromDateChange: (value: string) => void;
	onToDateChange: (value: string) => void;
	onPaymentStatusesChange: (statuses: PaymentStatus[]) => void;
}

const dateFilterOptions: { label: string; value: BillDateFilter }[] = [
	{ label: "All Time", value: "all" },
	{ label: "Today", value: "today" },
	{ label: "This Week", value: "week" },
	{ label: "This Month", value: "month" },
	{ label: "Custom Range", value: "custom" },
];

export const paymentStatusOptions: { label: string; value: PaymentStatus }[] = [
	{ label: "Not Paid", value: "not_paid" },
	{ label: "Partially Paid", value: "partially_paid" },
	{ label: "Fully Paid", value: "fully_paid" },
];

const paymentStatusLabels: Record<PaymentStatus, string> = {
	not_paid: "Not Paid",
	partially_paid: "Partially Paid",
	fully_paid: "Fully Paid",
};

export default function BillToolbar({
	searchQuery,
	dateFilter,
	fromDate,
	toDate,
	paymentStatuses,
	documentType = "bill",
	onSearchQueryChange,
	onDateFilterChange,
	onFromDateChange,
	onToDateChange,
	onPaymentStatusesChange,
}: BillToolbarProps) {
	const currentDate = new Date();
	const today = [
		currentDate.getFullYear(),
		String(currentDate.getMonth() + 1).padStart(2, "0"),
		String(currentDate.getDate()).padStart(2, "0"),
	].join("-");

	return (
		<Stack spacing={2}>
			<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
				<TextField
					value={searchQuery}
					onChange={(event) => onSearchQueryChange(event.target.value)}
					placeholder={
						documentType === "quotation"
							? "Search by customer name or quotation number..."
							: "Search by customer name or invoice number..."
					}
					fullWidth
					slotProps={{
						input: {
							startAdornment: (
								<InputAdornment position='start'>
									<SearchOutlined />
								</InputAdornment>
							),
						},
					}}
				/>
				<Select
					value={dateFilter}
					onChange={(event) =>
						onDateFilterChange(event.target.value as BillDateFilter)
					}
					startAdornment={
						<InputAdornment position='start'>
							<CalendarTodayOutlined />
						</InputAdornment>
					}
					sx={{ minWidth: { sm: 180 } }}
				>
					{dateFilterOptions.map((option) => (
						<MenuItem key={option.value} value={option.value}>
							{option.label}
						</MenuItem>
					))}
				</Select>
				{documentType !== "quotation" && (
					<Select<PaymentStatus[]>
						multiple
						value={paymentStatuses}
						onChange={(event) => {
							const value = event.target.value;
							const nextStatuses =
								typeof value === "string"
									? (value.split(",") as PaymentStatus[])
									: (value as PaymentStatus[]);
							onPaymentStatusesChange(nextStatuses);
						}}
						renderValue={(selected) => {
							if (!selected || selected.length === 0) {
								return "All Statuses";
							}
							return selected
								.map((status) => paymentStatusLabels[status] || status)
								.join(", ");
						}}
						displayEmpty
						startAdornment={
							<InputAdornment position='start'>
								<FilterListOutlined />
							</InputAdornment>
						}
						sx={{ minWidth: { sm: 190 } }}
					>
						{paymentStatusOptions.map((option) => (
							<MenuItem key={option.value} value={option.value}>
								<Checkbox
									checked={paymentStatuses.includes(option.value)}
									size='small'
								/>
								<ListItemText primary={option.label} />
							</MenuItem>
						))}
					</Select>
				)}
			</Stack>
			{dateFilter === "custom" && (
				<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
					<TextField
						label='From Date'
						type='date'
						value={fromDate}
						onChange={(event) => onFromDateChange(event.target.value)}
						slotProps={{
							inputLabel: { shrink: true },
							htmlInput: { max: today },
						}}
						fullWidth
					/>
					<TextField
						label='To Date'
						type='date'
						value={toDate}
						onChange={(event) => onToDateChange(event.target.value)}
						slotProps={{
							inputLabel: { shrink: true },
							htmlInput: { max: today, min: fromDate || undefined },
						}}
						fullWidth
					/>
				</Stack>
			)}
		</Stack>
	);
}
