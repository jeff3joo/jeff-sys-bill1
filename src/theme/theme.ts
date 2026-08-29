import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
	palette: {
		mode: "light",

		primary: {
			main: "#0F172A",
			light: "#1E293B",
			dark: "#020617",
			contrastText: "#FFFFFF",
		},

		secondary: {
			main: "#2563EB",
			light: "#3B82F6",
			dark: "#1D4ED8",
			contrastText: "#FFFFFF",
		},

		background: {
			default: "#F6F8FA",
			paper: "#FFFFFF",
		},

		text: {
			primary: "#0F172A",
			secondary: "#64748B",
		},

		divider: "#E2E8F0",

		success: {
			main: "#10B981",
			light: "#ECFDF5",
			dark: "#047857",
		},

		warning: {
			main: "#D97706",
			light: "#FFFBEB",
			dark: "#B45309",
		},

		error: {
			main: "#EF4444",
			light: "#FEF2F2",
			dark: "#B91C1C",
		},
	},

	typography: {
		fontFamily:
			'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',

		h1: {
			fontWeight: 700,
			letterSpacing: "-0.025em",
		},

		h2: {
			fontWeight: 700,
			letterSpacing: "-0.025em",
		},

		h3: {
			fontWeight: 700,
			letterSpacing: "-0.02em",
		},

		h4: {
			fontWeight: 700,
			letterSpacing: "-0.02em",
		},

		h5: {
			fontWeight: 700,
			letterSpacing: "-0.015em",
		},

		h6: {
			fontWeight: 600,
			letterSpacing: "-0.01em",
		},

		button: {
			textTransform: "none",
			fontWeight: 600,
		},
	},

	shape: {
		borderRadius: 8,
	},

	components: {
		MuiButton: {
			defaultProps: {
				disableElevation: true,
			},
			styleOverrides: {
				root: {
					borderRadius: 8,
					fontWeight: 600,
					transition: "all 0.15s ease-in-out",
				},
				contained: {
					"&:hover": {
						boxShadow: "0 2px 6px rgba(15, 23, 42, 0.18)",
					},
				},
				outlined: {
					borderColor: "#CBD5E1",
					"&:hover": {
						borderColor: "#94A3B8",
						backgroundColor: "rgba(15, 23, 42, 0.03)",
					},
				},
			},
		},

		MuiCard: {
			defaultProps: {
				elevation: 0,
			},
			styleOverrides: {
				root: {
					borderRadius: 12,
					border: "1px solid #E2E8F0",
					boxShadow:
						"0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)",
					transition:
						"box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out",
				},
			},
		},

		MuiTextField: {
			defaultProps: {
				size: "small",
			},
		},

		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					backgroundColor: "#FFFFFF",
					"& .MuiOutlinedInput-notchedOutline": {
						borderColor: "#E2E8F0",
						transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
					},
					"&:hover .MuiOutlinedInput-notchedOutline": {
						borderColor: "#CBD5E1",
					},
					"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
						borderColor: "#2563EB",
						borderWidth: 1.5,
					},
					"&.Mui-focused": {
						boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.12)",
					},
				},
			},
		},

		MuiChip: {
			styleOverrides: {
				root: {
					borderRadius: 6,
					fontWeight: 600,
					fontSize: "0.75rem",
				},
			},
		},

		MuiToggleButtonGroup: {
			styleOverrides: {
				root: {
					backgroundColor: "#F1F5F9",
					padding: 3,
					borderRadius: 10,
					border: "1px solid #E2E8F0",
				},
			},
		},

		MuiToggleButton: {
			styleOverrides: {
				root: {
					borderRadius: 7,
					border: "none",
					padding: "4px 14px",
					color: "#64748B",
					fontWeight: 600,
					textTransform: "none",
					transition: "all 0.15s ease-in-out",
					"&.Mui-selected": {
						backgroundColor: "#FFFFFF",
						color: "#0F172A",
						boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
						"&:hover": {
							backgroundColor: "#FFFFFF",
						},
					},
					"&:hover": {
						backgroundColor: "rgba(255, 255, 255, 0.5)",
					},
				},
			},
		},

		MuiDialog: {
			styleOverrides: {
				paper: {
					borderRadius: 14,
					boxShadow:
						"0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
				},
			},
		},
	},
});
