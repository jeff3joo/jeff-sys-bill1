"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
				}}
			>
				<CardContent sx={{ p: { xs: 3, sm: 4 } }}>
					<Box
						component='form'
						onSubmit={(event) => {
							event.preventDefault();
							handleLogin();
						}}
					>
						<Stack spacing={3}>
							<Box>
								<Typography variant='h5' sx={{ fontWeight: 700 }}>
									JEFF SYSTEMS
								</Typography>

								<Typography color='text.secondary' sx={{ mt: 0.5 }}>
									Billing Management
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
