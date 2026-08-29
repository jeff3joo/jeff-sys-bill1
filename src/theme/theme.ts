import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
	palette: {
		mode: "light",

		primary: {
			main: "#FF5A00",
			light: "#FF7A29",
			dark: "#E65100",
			contrastText: "#FFFFFF",
		},

		secondary: {
			main: "#0F1F33",
			light: "#1E2F47",
			dark: "#0A1626",
			contrastText: "#FFFFFF",
		},

		background: {
			default: "#F4F5F7",
			paper: "#FFFFFF",
		},

		text: {
			primary: "#172033",
			secondary: "#64748B",
		},

		divider: "#E2E8F0",

		success: {
			main: "#10B981",
			light: "#ECFDF5",
			dark: "#047857",
			contrastText: "#FFFFFF",
		},

		warning: {
			main: "#F59E0B",
			light: "#FFFBEB",
			dark: "#D97706",
			contrastText: "#FFFFFF",
		},

		error: {
			main: "#EF4444",
			light: "#FEF2F2",
			dark: "#B91C1C",
			contrastText: "#FFFFFF",
		},
	},

	typography: {
		fontFamily:
			'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',

		h1: {
			fontWeight: 700,
			letterSpacing: "-0.025em",
			color: "#172033",
		},

		h2: {
			fontWeight: 700,
			letterSpacing: "-0.025em",
			color: "#172033",
		},

		h3: {
			fontWeight: 700,
			letterSpacing: "-0.02em",
			color: "#172033",
		},

		h4: {
			fontWeight: 700,
			letterSpacing: "-0.02em",
			color: "#172033",
		},

		h5: {
			fontWeight: 700,
			letterSpacing: "-0.015em",
			color: "#172033",
		},

		h6: {
			fontWeight: 600,
			letterSpacing: "-0.01em",
			color: "#172033",
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
					backgroundColor: "#FF5A00",
					color: "#FFFFFF",
					"&:hover": {
						backgroundColor: "#E65100",
						boxShadow: "0 2px 10px rgba(255, 90, 0, 0.32)",
					},
				},
				outlined: {
					borderColor: "#CBD5E1",
					color: "#172033",
					"&:hover": {
						borderColor: "#94A3B8",
						backgroundColor: "rgba(15, 31, 51, 0.04)",
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
					backgroundColor: "#FFFFFF",
					backgroundImage: "none",
					boxShadow:
						"0 1px 3px 0 rgba(15, 31, 51, 0.04), 0 1px 2px -1px rgba(15, 31, 51, 0.02)",
					transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
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
					color: "#172033",
					"& .MuiOutlinedInput-notchedOutline": {
						borderColor: "#E2E8F0",
						transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
					},
					"&:hover .MuiOutlinedInput-notchedOutline": {
						borderColor: "#CBD5E1",
					},
					"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
						borderColor: "#FF5A00",
						borderWidth: 1.5,
					},
					"&.Mui-focused": {
						boxShadow: "0 0 0 3px rgba(255, 90, 0, 0.15)",
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
						backgroundColor: "#FF5A00",
						color: "#FFFFFF",
						boxShadow: "0 2px 6px rgba(255, 90, 0, 0.35)",
						"&:hover": {
							backgroundColor: "#E65100",
						},
					},
					"&:hover": {
						backgroundColor: "rgba(255, 255, 255, 0.6)",
						color: "#172033",
					},
				},
			},
		},

		MuiDialog: {
			styleOverrides: {
				paper: {
					borderRadius: 14,
					backgroundColor: "#FFFFFF",
					backgroundImage: "none",
					border: "1px solid #E2E8F0",
					boxShadow:
						"0 20px 25px -5px rgba(15, 31, 51, 0.1), 0 8px 10px -6px rgba(15, 31, 51, 0.04)",
				},
			},
		},

		MuiMenu: {
			styleOverrides: {
				paper: {
					borderRadius: 10,
					backgroundColor: "#FFFFFF",
					backgroundImage: "none",
					border: "1px solid #E2E8F0",
					boxShadow:
						"0 10px 25px -5px rgba(15, 31, 51, 0.08), 0 8px 10px -6px rgba(15, 31, 51, 0.03)",
				},
			},
		},

		MuiMenuItem: {
			styleOverrides: {
				root: {
					color: "#172033",
					transition: "all 0.12s ease-in-out",
					"&:hover": {
						backgroundColor: "rgba(15, 31, 51, 0.04)",
					},
					"&.Mui-selected": {
						backgroundColor: "rgba(255, 90, 0, 0.08)",
						color: "#FF5A00",
						"&:hover": {
							backgroundColor: "rgba(255, 90, 0, 0.15)",
						},
					},
				},
			},
		},
	},
});
