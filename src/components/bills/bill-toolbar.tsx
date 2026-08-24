import {
	InputAdornment,
	MenuItem,
	Select,
	Stack,
	TextField,
	} from "@mui/material";
import { CalendarTodayOutlined, SearchOutlined } from "@mui/icons-material";

export type BillDateFilter = "all" | "today" | "week" | "month" | "custom";

export interface BillToolbarProps {
	searchQuery: string;
	dateFilter: BillDateFilter;
	fromDate: string;
	toDate: string;
	onSearchQueryChange: (value: string) => void;
	onDateFilterChange: (value: BillDateFilter) => void;
	onFromDateChange: (value: string) => void;
	onToDateChange: (value: string) => void;
}

const dateFilterOptions: { label: string; value: BillDateFilter }[] = [
	{ label: "All Time", value: "all" },
	{ label: "Today", value: "today" },
	{ label: "This Week", value: "week" },
	{ label: "This Month", value: "month" },
	{ label: "Custom Range", value: "custom" },
];

export default function BillToolbar({
	searchQuery,
	dateFilter,
	fromDate,
	toDate,
	onSearchQueryChange,
	onDateFilterChange,
	onFromDateChange,
	onToDateChange,
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
				placeholder='Search by customer name or invoice number...'
				fullWidth
				slotProps={{
					input: {
						startAdornment: (
							<InputAdornment position='start'><SearchOutlined /></InputAdornment>
						),
					},
				}}
			/>
			<Select
				value={dateFilter}
				onChange={(event) => onDateFilterChange(event.target.value as BillDateFilter)}
				startAdornment={<InputAdornment position='start'><CalendarTodayOutlined /></InputAdornment>}
				 sx={{ minWidth: { sm: 180 } }}
			>
				{dateFilterOptions.map((option) => (
					<MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
				))}
			</Select>
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