import { Pagination, Stack } from "@mui/material";

interface BillPaginationProps {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export default function BillPagination({ page, totalPages, onPageChange }: BillPaginationProps) {
	if (totalPages <= 1) {
		return null;
	}

	return <Stack sx={{ alignItems: "center", px: 2, pb: 3 }}><Pagination count={totalPages} page={page} onChange={(_, value) => onPageChange(value)} /></Stack>;
}