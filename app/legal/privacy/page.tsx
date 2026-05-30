import { Suspense } from "react";
import { LegalDocumentView } from "@/components/legal/legal-document-view";
import { Loader2 } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LegalDocumentView type="privacy" />
    </Suspense>
  );
}
