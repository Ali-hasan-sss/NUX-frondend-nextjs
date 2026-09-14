export const GOOGLE_ID_TOKEN_COOKIE = "nux_google_id_token";
export const GOOGLE_CALLBACK_PATH = "/auth/google/callback";

export function googleCallbackUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}${GOOGLE_CALLBACK_PATH}`;
}
