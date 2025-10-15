import { MultiStepRegisterForm } from "@/components/auth/multi-step-register-form";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <div className="px-1 py-2 w-20 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-2xl">
                NUX
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Join NUX</h1>
            <p className="text-muted-foreground">
              Create your account and start your journey with us
            </p>
          </div>
          <MultiStepRegisterForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
