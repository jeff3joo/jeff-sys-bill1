"use client";

import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const supabase = createClient();

	const handleLogin = async () => {
		setLoading(true);
		setErrorMessage("");

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			setErrorMessage(error.message);
			setLoading(false);
			return;
		}

		router.push("/dashboard");
		router.refresh();
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				bgcolor: "background.default",
				px: 2,
			}}
		>
			<Card
				sx={{
					width: "100%",
					maxWidth: 420,
					boxShadow:
						"0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.03)",
					border: "1px solid",
					borderColor: "#E2E8F0",
				}}
			>
				<CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
					<Box
						component='form'
						onSubmit={(event) => {
							event.preventDefault();
							handleLogin();
						}}
					>
						<Stack spacing={{ xs: 2.5, sm: 3 }}>
							<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
								<Box
									sx={{
										width: 48,
										height: 48,
										borderRadius: 2.5,
										bgcolor: "primary.main",
										color: "#FFFFFF",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontWeight: 800,
										fontSize: "1.125rem",
										mb: 1.5,
										boxShadow: "0 2px 6px rgba(15, 23, 42, 0.2)",
									}}
								>
									JS
								</Box>
								<Typography
									variant='h5'
									sx={{
										fontSize: { xs: "1.25rem", sm: "1.5rem" },
										fontWeight: 800,
										letterSpacing: "-0.02em",
									}}
								>
									JEFF SYSTEMS
								</Typography>

								<Typography
									variant='body2'
									color='text.secondary'
									sx={{ mt: 0.5, fontSize: "0.85rem" }}
								>
									Sign in to your billing management account
								</Typography>
							</Box>

							{errorMessage && <Alert severity='error'>{errorMessage}</Alert>}

							<TextField
								label='Email'
								type='email'
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								fullWidth
								autoComplete='email'
							/>

							<TextField
								label='Password'
								type='password'
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								fullWidth
								autoComplete='current-password'
							/>

							<Button
								type='submit'
								variant='contained'
								size='large'
								disabled={loading}
								sx={{
									py: 1.25,
									fontWeight: 700,
									fontSize: "0.95rem",
								}}
							>
								{loading ? "Signing in..." : "Sign in"}
							</Button>
						</Stack>
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
}
