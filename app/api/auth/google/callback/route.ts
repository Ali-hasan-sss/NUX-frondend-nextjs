import { NextRequest, NextResponse } from "next/server";
import { GOOGLE_ID_TOKEN_COOKIE } from "@/lib/googleAuth";

function requestOrigin(req: NextRequest): URL {
  const host =
    req.headers.get("x-forwarded-host") || req.headers.get("host") || "nuxapp.de";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return new URL(`${proto}://${host}`);
}

function failRedirect(origin: URL) {
  const url = new URL("/auth/login", origin);
  url.searchParams.set("google_error", "1");
  return NextResponse.redirect(url, 303);
}

function takeToken(form: FormData): string {
  const credential = String(form.get("credential") || "").trim();
  if (credential) return credential;
  return String(form.get("id_token") || "").trim();
}

export async function POST(req: NextRequest) {
  const origin = requestOrigin(req);

  let token = "";
  try {
    const form = await req.formData();
    token = takeToken(form);
  } catch {
    token = "";
  }

  if (!token) {
    return failRedirect(origin);
  }

  const dest = new URL("/auth/google/complete", origin);
  const res = NextResponse.redirect(dest, 303);
  res.cookies.set(GOOGLE_ID_TOKEN_COOKIE, encodeURIComponent(token), {
    httpOnly: false,
    secure: origin.protocol === "https:",
    sameSite: "lax",
    maxAge: 120,
    path: "/",
  });
  return res;
}
