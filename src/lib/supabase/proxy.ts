import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {

	let supabaseResponse = NextResponse.next({
		request,
	});

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},

				setAll(cookiesToSet) {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					cookiesToSet.forEach(({ name, value, options: _o }) => {
						request.cookies.set(name, value);
					});

					supabaseResponse = NextResponse.next({
						request,
					});

					cookiesToSet.forEach(({ name, value, options }) => {
						supabaseResponse.cookies.set(name, value, options);
					});
				},
			},
		},
	);

	const { data: claimsData } = await supabase.auth.getClaims();

	const pathname = request.nextUrl.pathname;

	const protectedRoutes = ["/dashboard", "/products", "/billing", "/settings", "/bills", "/schedule"];

	const isProtectedRoute = protectedRoutes.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`),
	);

	const isAuthenticated = !!claimsData?.claims;

	if (isProtectedRoute && !isAuthenticated) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	if (pathname === "/login" && isAuthenticated) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	if (pathname === "/" && isAuthenticated) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	if (pathname === "/" && !isAuthenticated) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return supabaseResponse;
}
