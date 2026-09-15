"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/app/hooks";
import { loginWithGoogle } from "@/features/auth/authThunks";
import { clearError, setError } from "@/features/auth/authSlice";
import { GoogleLogin } from "@react-oauth/google";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { getDashboardPathForRole } from "@/lib/roleDashboard";
import {
  buildGoogleOidcRedirectUrl,
  googleCallbackUrl,
} from "@/lib/googleAuth";
import {
  peekAuthRedirect,
  rememberAuthRedirect,
  resolvePostLoginPath,
} from "@/lib/authRedirect";

function isAppleOrSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafariBrowser =
    /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return isIos || isSafariBrowser;
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

type GoogleSignInButtonProps = {
  mode: "signin" | "signup";
  disabled?: boolean;
  className?: string;
};

export function GoogleSignInButton({
  mode,
  className,
  disabled = false,
}: GoogleSignInButtonProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [ready, setReady] = useState(false);
  const [useRedirect, setUseRedirect] = useState(false);
  const isDark = resolvedTheme === "dark";
  const buttonTheme = isDark ? "filled_black" : "outline";
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  useEffect(() => {
    setUseRedirect(isAppleOrSafari());
    setReady(true);
    const next = peekAuthRedirect();
    if (next) rememberAuthRedirect(next);
  }, []);

  const handleSuccess = async (credential: string | undefined) => {
    if (disabled || !credential) return;
    dispatch(clearError());
    const result = await dispatch(loginWithGoogle(credential));
    if (loginWithGoogle.fulfilled.match(result)) {
      const user = result.payload.user;
      router.push(
        resolvePostLoginPath({
          role: user?.role,
          emailVerified: user?.emailVerified,
          email: user?.email,
          fallback: getDashboardPathForRole(user?.role),
        }),
      );
    }
  };

  const startAppleRedirect = () => {
    if (disabled || !clientId) {
      dispatch(setError("Google sign-in was cancelled or failed"));
      return;
    }
    const next = peekAuthRedirect();
    if (next) rememberAuthRedirect(next);
    const redirectUri = googleCallbackUrl(window.location.origin);
    window.location.assign(buildGoogleOidcRedirectUrl(clientId, redirectUri));
  };

  return (
    <div
      dir="ltr"
      className={cn(
        "flex w-full justify-center items-center rounded-xl border border-input bg-background min-h-[3rem] py-1 overflow-hidden",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      aria-disabled={disabled}
    >
      {!ready ? (
        <div className="h-10 w-full max-w-[320px]" />
      ) : useRedirect ? (
        <button
          type="button"
          onClick={startAppleRedirect}
          disabled={disabled}
          className="flex h-10 w-full max-w-[320px] items-center justify-center gap-3 rounded-md bg-white px-3 text-sm font-medium text-[#1f1f1f] shadow-sm ring-1 ring-black/10"
        >
          <GoogleMark />
          {mode === "signup"
            ? t("landing.auth.signUpWithGoogle")
            : t("landing.auth.signInWithGoogle")}
        </button>
      ) : (
        <GoogleLogin
          onSuccess={(res) => handleSuccess(res?.credential)}
          onError={() => {
            dispatch(setError("Google sign-in was cancelled or failed"));
          }}
          useOneTap={false}
          theme={buttonTheme}
          size="large"
          text={mode === "signup" ? "signup_with" : "signin_with"}
          shape="rectangular"
          width="320"
          use_fedcm_for_button={false}
          ux_mode="popup"
          containerProps={{
            className:
              "!w-full !flex !justify-center !min-h-[2.5rem] [&>div]:!min-h-[2.5rem]",
            style: { minHeight: 40, width: "100%" },
          }}
        />
      )}
    </div>
  );
}
