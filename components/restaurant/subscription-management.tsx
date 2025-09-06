"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, CreditCard, Calendar, TrendingUp, AlertTriangle } from "lucide-react"
import { useAppSelector } from "@/app/hooks"

// Mock data - in real app, this would come from API
const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    period: "month",
    description: "Perfect for small restaurants getting started",
    features: [
      "Up to 100 loyalty points/month",
      "Basic QR code management",
      "Email support",
      "Mobile app access",
      "Basic analytics",
    ],
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: 79,
    period: "month",
    description: "Ideal for growing restaurant businesses",
    features: [
      "Up to 1,000 loyalty points/month",
      "Advanced QR code management",
      "Group management features",
      "Priority support",
      "Advanced analytics & reports",
      "Multi-language support",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    period: "month",
    description: "For large restaurant chains and franchises",
    features: [
      "Unlimited loyalty points",
      "Full platform access",
      "Custom integrations",
      "24/7 dedicated support",
      "White-label options",
      "Advanced security features",
    ],
    popular: false,
  },
]

const currentSubscription = {
  plan: "Professional",
  status: "active",
  nextBilling: "2024-02-29",
  amount: 79,
  paymentMethod: "Credit Card ****1234",
}

export function SubscriptionManagement() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const { user } = useAppSelector((state) => state.auth)

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
    // In real app, this would initiate the subscription change process
    console.log("Selected plan:", planId)
  }

  const handleCancelSubscription = () => {
    // In real app, this would show a confirmation dialog and cancel the subscription
    console.log("Cancel subscription")
  }

  const currentPlan = plans.find((plan) => plan.name === currentSubscription.plan)
  const isUpgrade = (planPrice: number) => planPrice > (currentPlan?.price || 0)
  const isDowngrade = (planPrice: number) => planPrice < (currentPlan?.price || 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Subscription Management</h1>
        <p className="text-muted-foreground">Manage your RestaurantHub subscription and billing</p>
      </div>

      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>Your active subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                <p className="text-lg font-bold">{currentSubscription.plan}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{currentSubscription.status}</Badge>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Billing</p>
                <p className="text-lg font-bold">{new Date(currentSubscription.nextBilling).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Cost</p>
                <p className="text-lg font-bold">${currentSubscription.amount}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payment Method</p>
                <p className="text-sm text-muted-foreground">{currentSubscription.paymentMethod}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" className="bg-transparent">
                  Update Payment
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelSubscription}
                  className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                >
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Change Alert */}
      {selectedPlan && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have selected a new plan. Changes will take effect at your next billing cycle on{" "}
            {new Date(currentSubscription.nextBilling).toLocaleDateString()}.
          </AlertDescription>
        </Alert>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.name === currentSubscription.plan
            const isSelected = selectedPlan === plan.id

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? "border-primary shadow-lg"
                    : isCurrent
                      ? "border-green-500 bg-green-50/50"
                      : isSelected
                        ? "border-secondary shadow-md"
                        : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-6">
                    {isCurrent ? (
                      <Button className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => handlePlanSelect(plan.id)}
                      >
                        {isSelected
                          ? "Selected"
                          : isUpgrade(plan.price)
                            ? "Upgrade"
                            : isDowngrade(plan.price)
                              ? "Downgrade"
                              : "Select Plan"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>Manage your billing details and payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Billing Address</h4>
                <p className="text-sm text-muted-foreground">{user?.restaurantName}</p>
                <p className="text-sm text-muted-foreground">{user?.address}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Payment Method</h4>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{currentSubscription.paymentMethod}</span>
                </div>
                <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                  Update Payment Method
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
