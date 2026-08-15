import { Typography } from "@mui/material";
import AppShell from "@/components/layout/app-shell";

export default function DashboardPage() {
  return (
    <AppShell>
      <Typography variant="h4" sx={{fontWeight:700}}>
        Dashboard
      </Typography>

      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Welcome to Jeff Systems Billing Management.
      </Typography>
    </AppShell>
  );
}