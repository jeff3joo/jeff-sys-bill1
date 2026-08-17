import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
	palette: {
		mode: "light",

		primary: {
			main: "#111827",
		},

		secondary: {
			main: "#2563EB",
		},

		background: {
			default: "#F8FAFC",
			paper: "#FFFFFF",
		},

		text: {
			primary: "#111827",
			secondary: "#64748B",
		},
	},

	typography: {
		fontFamily: "Arial, Helvetica, sans-serif",

		h1: {
			fontWeight: 700,
		},

		h2: {
			fontWeight: 700,
		},

		h3: {
			fontWeight: 700,
		},

		h4: {
			fontWeight: 700,
		},

		button: {
			textTransform: "none",
			fontWeight: 600,
		},
	},

	shape: {
		borderRadius: 10,
	},

	components: {
		MuiButton: {
			defaultProps: {
				disableElevation: true,
			},
		},

		MuiCard: {
			defaultProps: {
				elevation: 0,
			},

			styleOverrides: {
				root: {
					border: "1px solid #E2E8F0",
				},
			},
		},

		MuiTextField: {
			defaultProps: {
				size: "small",
			},
		},
	},
});
