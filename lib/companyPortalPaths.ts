/** Same “section” when switching company: settings root, employees, wallet, or invoices. */
export function companyRouteSuffix(pathname: string | null): "" | "/employees" | "/wallet" | "/invoices" {
  if (!pathname) return "";
  if (pathname.includes("/employees")) return "/employees";
  if (pathname.includes("/wallet")) return "/wallet";
  if (pathname.includes("/invoices")) return "/invoices";
  return "";
}
