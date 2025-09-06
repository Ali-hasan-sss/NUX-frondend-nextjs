import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-2xl">R</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Join RestaurantHub</h1>
          <p className="text-muted-foreground">Create your restaurant account and start building customer loyalty</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
