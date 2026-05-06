"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import type { CreateCompanyOwnerRequest } from "@/features/admin/users/adminUsersTypes";

interface CompanyOwnerFormProps {
  onSubmit: (data: CreateCompanyOwnerRequest) => Promise<void>;
  onClose: () => void;
  submitLabel?: string;
}

export function CompanyOwnerForm({
  onSubmit,
  onClose,
  submitLabel,
}: CompanyOwnerFormProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [commercialRegister, setCommercialRegister] = useState("");
  const [employeeCount, setEmployeeCount] = useState("0");
  const [monthlyAllowancePerEmployee, setMonthlyAllowancePerEmployee] =
    useState("0");
  const [subscriptionPerEmployeeEur, setSubscriptionPerEmployeeEur] =
    useState("1.75");
  const [loading, setLoading] = useState(false);

  const estimatedMonthly = useMemo(() => {
    const n = Math.max(0, Math.floor(Number(employeeCount) || 0));
    const rate = parseFloat(String(subscriptionPerEmployeeEur).replace(",", "."));
    if (!Number.isFinite(rate) || rate < 0) return "0.00";
    return (n * rate).toFixed(2);
  }, [employeeCount, subscriptionPerEmployeeEur]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        email: email.trim(),
        password,
        fullName: fullName.trim() || undefined,
        isActive,
        company: {
          name: companyName.trim(),
          taxNumber: taxNumber.trim(),
          commercialRegister: commercialRegister.trim(),
          employeeCount: Math.max(0, Math.floor(Number(employeeCount) || 0)),
          monthlyAllowancePerEmployee: monthlyAllowancePerEmployee.trim() || "0",
          subscriptionPerEmployeeEur:
            subscriptionPerEmployeeEur.trim() || "1.75",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="co-fullName">{t("fullName")}</Label>
        <Input
          id="co-fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="co-email">{t("email")}</Label>
        <Input
          id="co-email"
          type="email"
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="co-password">{t("password")}</Label>
        <div className="relative">
          <Input
            id="co-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="co-active">{t("active")}</Label>
        <Switch
          id="co-active"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
      </div>

      <div className="border-t pt-4 space-y-3">
        <p className="text-sm font-medium text-foreground">
          {t("companyOwnerFormCompanySection")}
        </p>
        <div className="space-y-2">
          <Label htmlFor="co-cname">{t("companyName")}</Label>
          <Input
            id="co-cname"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="co-tax">{t("taxNumber")}</Label>
          <Input
            id="co-tax"
            value={taxNumber}
            onChange={(e) => setTaxNumber(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="co-cr">{t("commercialRegister")}</Label>
          <Input
            id="co-cr"
            value={commercialRegister}
            onChange={(e) => setCommercialRegister(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="co-ec">{t("employeeCount")}</Label>
          <Input
            id="co-ec"
            type="number"
            min={0}
            step={1}
            value={employeeCount}
            onChange={(e) => setEmployeeCount(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="co-allow">{t("monthlyAllowancePerEmployee")}</Label>
          <Input
            id="co-allow"
            inputMode="decimal"
            value={monthlyAllowancePerEmployee}
            onChange={(e) => setMonthlyAllowancePerEmployee(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="co-sub">{t("subscriptionPerEmployeeEur")}</Label>
          <Input
            id="co-sub"
            inputMode="decimal"
            value={subscriptionPerEmployeeEur}
            onChange={(e) => setSubscriptionPerEmployeeEur(e.target.value)}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {t("estimatedMonthlySubscription")}:{" "}
          <span className="font-semibold text-foreground">
            {estimatedMonthly} EUR
          </span>
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? t("loading") : submitLabel ?? t("create")}
        </Button>
      </div>
    </form>
  );
}
