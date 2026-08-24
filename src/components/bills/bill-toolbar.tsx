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
	onSearchQueryChange: (value: string) => void;
	onDateFilterChange: (value: BillDateFilter) => void;
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
	onSearchQueryChange,
	onDateFilterChange,
}: BillToolbarProps) {
	return (
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
	);
}