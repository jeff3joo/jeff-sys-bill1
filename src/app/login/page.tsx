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
				bgcolor: "#0F1F33",
				backgroundImage:
					"radial-gradient(circle at 50% 35%, rgba(255, 90, 0, 0.12) 0%, transparent 65%)",
				px: 2,
			}}
		>
			<Card
				sx={{
					width: "100%",
					maxWidth: 420,
					bgcolor: "#FFFFFF",
					boxShadow: "0 25px 50px -12px rgba(15, 31, 51, 0.35)",
					border: "1px solid #E2E8F0",
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
									component='img'
									src='/logo/logo.png'
									alt='Jeff Systems Logo'
									sx={{
										width: 64,
										height: 64,
										borderRadius: 2,
										objectFit: "contain",
										mb: 1.5,
									}}
								/>
								<Typography
									variant='h5'
									sx={{
										fontSize: { xs: "1.25rem", sm: "1.5rem" },
										fontWeight: 800,
										letterSpacing: "-0.02em",
										color: "#172033",
									}}
								>
									JEFF SYSTEMS
								</Typography>

								<Typography
									variant='body2'
									sx={{ mt: 0.5, fontSize: "0.85rem", color: "#64748B" }}
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
									bgcolor: "#FF5A00",
									color: "#FFFFFF",
									boxShadow: "0 4px 14px rgba(255, 90, 0, 0.35)",
									"&:hover": {
										bgcolor: "#E65100",
										boxShadow: "0 6px 18px rgba(255, 90, 0, 0.5)",
									},
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
