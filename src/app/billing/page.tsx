"use client";

import {
	Box,
	Button,
	Card,
	CardContent,
	Container,
	Divider,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import AppShell from "@/components/layout/app-shell";

export default function BillingPage() {
	return (
		<AppShell>
			<Container
				maxWidth='lg'
				sx={{
					py: {
						xs: 3,
						sm: 5,
					},
				}}
			>
				<Stack spacing={4}>
					{/* Header */}
					<Box>
						<Typography
							variant='h4'
							sx={{
								fontWeight: 700,
								mb: 1,
							}}
						>
							New Bill
						</Typography>

						<Typography variant='body1' color='text.secondary'>
							Create a new invoice for your customer.
						</Typography>
					</Box>

					{/* Customer */}
					<Card>
						<CardContent>
							<Stack spacing={3}>
								<Box>
									<Typography variant='h6' sx={{ fontWeight: 700 }}>
										Customer Details
									</Typography>

									<Typography variant='body2' color='text.secondary'>
										Enter the customer's information.
									</Typography>
								</Box>

								<Stack
									direction={{
										xs: "column",
										sm: "row",
									}}
									spacing={2}
								>
									<TextField
										label='Customer Name'
										placeholder='Enter customer name'
										fullWidth
									/>

									<TextField
										label='Phone Number'
										placeholder='Enter phone number'
										fullWidth
									/>
								</Stack>

								<Stack
									direction={{
										xs: "column",
										sm: "row",
									}}
									spacing={2}
								>
									<TextField
										label='Email'
										placeholder='customer@example.com'
										type='email'
										fullWidth
									/>

									<TextField
										label='Address'
										placeholder='Customer address'
										fullWidth
									/>
								</Stack>
							</Stack>
						</CardContent>
					</Card>

					{/* Items */}
					<Card>
						<CardContent>
							<Stack spacing={3}>
								<Box>
									<Typography variant='h6' sx={{ fontWeight: 700 }}>
										Bill Items
									</Typography>

									<Typography variant='body2' color='text.secondary'>
										Add products or services to this bill.
									</Typography>
								</Box>

								<TextField
									label='Search products or services'
									placeholder='Search by name...'
									fullWidth
								/>

								<Box
									sx={{
										minHeight: 180,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										textAlign: "center",
									}}
								>
									<Stack spacing={1}>
										<Typography variant='body1' sx={{ fontWeight: 600 }}>
											No items added
										</Typography>

										<Typography variant='body2' color='text.secondary'>
											Search for a product or service to add it to the bill.
										</Typography>
									</Stack>
								</Box>
							</Stack>
						</CardContent>
					</Card>

					{/* Summary */}
					<Card>
						<CardContent>
							<Stack spacing={2}>
								<Typography variant='h6' sx={{ fontWeight: 700 }}>
									Bill Summary
								</Typography>

								<Stack
									direction='row'
									sx={{
										justifyContent: "space-between",
									}}
								>
									<Typography color='text.secondary'>Subtotal</Typography>

									<Typography>₹0.00</Typography>
								</Stack>

								<Stack
									direction='row'
									sx={{
										justifyContent: "space-between",
									}}
								>
									<Typography color='text.secondary'>Discount</Typography>

									<Typography>₹0.00</Typography>
								</Stack>

								<Divider />

								<Stack
									direction='row'
									sx={{
										justifyContent: "space-between",
									}}
								>
									<Typography variant='h6' sx={{ fontWeight: 700 }}>
										Total
									</Typography>

									<Typography variant='h6' sx={{ fontWeight: 700 }}>
										₹0.00
									</Typography>
								</Stack>

								<Button variant='contained' size='large' fullWidth>
									Generate Bill
								</Button>
							</Stack>
						</CardContent>
					</Card>
				</Stack>
			</Container>
		</AppShell>
	);
}