"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/app/hooks";
import { loginWithGoogle } from "@/features/auth/authThunks";
import { clearError, setError } from "@/features/auth/authSlice";
import { GoogleLogin } from "@react-oauth/google";

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

  return (
    <div className={className}>
      <GoogleLogin
        onSuccess={(res) => handleSuccess(res?.credential)}
        onError={() => {
          dispatch(setError("Google sign-in was cancelled or failed"));
        }}
        useOneTap={false}
      />
    </div>
  );
}
