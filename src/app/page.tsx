import { Button, Container, Typography } from "@mui/material";

export default function Home() {
  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h3" gutterBottom>
        Jeff Systems
      </Typography>

      <Typography variant="body1" color="text.secondary" gutterBottom>
        Billing Management System
      </Typography>

      <Button variant="contained">
        Create Bill
      </Button>
    </Container>
  );
}