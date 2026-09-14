"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/app/hooks";
import { loginWithGoogle } from "@/features/auth/authThunks";
import { clearError, setError } from "@/features/auth/authSlice";
import { GoogleLogin } from "@react-oauth/google";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { getDashboardPathForRole } from "@/lib/roleDashboard";
import { googleCallbackUrl } from "@/lib/googleAuth";
import { peekAuthRedirect, rememberAuthRedirect, resolvePostLoginPath } from "@/lib/authRedirect";

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
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [ready, setReady] = useState(false);
  const [useRedirect, setUseRedirect] = useState(false);
  const isDark = resolvedTheme === "dark";
  const buttonTheme = isDark ? "filled_black" : "outline";

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

  const loginUri =
    typeof window !== "undefined"
      ? googleCallbackUrl(window.location.origin)
      : undefined;

  return (
    <div
      dir="ltr"
      className={cn(
        "flex w-full justify-center items-center rounded-xl border border-input bg-background min-h-[3rem] py-1 overflow-hidden",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      aria-disabled={disabled}
    >
      {ready ? (
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
          itp_support
          use_fedcm_for_button={false}
          ux_mode={useRedirect ? "redirect" : "popup"}
          {...(useRedirect && loginUri ? { login_uri: loginUri } : {})}
          containerProps={{
            className:
              "!w-full !flex !justify-center !min-h-[2.5rem] [&>div]:!min-h-[2.5rem]",
            style: { minHeight: 40, width: "100%" },
          }}
        />
      ) : (
        <div className="h-10 w-full max-w-[320px]" />
      )}
    </div>
  );
}
