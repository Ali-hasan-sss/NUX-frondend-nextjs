"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/app/hooks";
import { loginWithGoogle } from "@/features/auth/authThunks";
import { clearError, setError } from "@/features/auth/authSlice";
import { GoogleLogin } from "@react-oauth/google";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

function isSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafariBrowser = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);
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
}: GoogleSignInButtonProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const useRedirect = isSafari();
  const isDark = resolvedTheme === "dark";
  const buttonTheme = isDark ? "filled_black" : "outline";

  const handleSuccess = async (credential: string | undefined) => {
    if (!credential) return;
    dispatch(clearError());
    const result = await dispatch(loginWithGoogle(credential));
    if (loginWithGoogle.fulfilled.match(result)) {
      const role = result.payload.user?.role;
      if (role === "ADMIN") router.push("/admin");
      else if (role === "RESTAURANT_OWNER") router.push("/dashboard");
      else router.push("/");
    }
  };

  const loginUri =
    typeof window !== "undefined"
      ? window.location.origin + window.location.pathname
      : undefined;

  return (
    <div className={cn("flex w-full justify-center", className)}>
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
        width="280"
        use_fedcm_for_button={false}
        ux_mode={useRedirect ? "redirect" : "popup"}
        {...(useRedirect && loginUri ? { login_uri: loginUri } : {})}
        containerProps={{
          className: "flex justify-center",
          style: { minHeight: 48 },
        }}
      />
    </div>
  );
}
