import { RegisterForm } from "@/components/auth/register-form";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="px-1 py-2 w-20 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-2xl">
                NUX
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Join RestaurantHub
            </h1>
            <p className="text-muted-foreground">
              Create your restaurant account and start building customer loyalty
            </p>
          </div>
          <RegisterForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
