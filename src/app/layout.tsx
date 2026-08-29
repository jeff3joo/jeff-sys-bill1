import "./globals.css";
import type { Metadata } from "next";

import AppThemeProvider from "@/components/providers/theme-provider";

export const metadata: Metadata = {
	title: "Jeff Systems",
	description: "Jeff Systems Billing Management",
	icons: {
		icon: "/logo/logo.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body>
				<AppThemeProvider>{children}</AppThemeProvider>
			</body>
		</html>
	);
}
