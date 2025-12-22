import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
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
    name: "Professional",
    price: "$79",
    period: "/month",
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
    name: "Enterprise",
    price: "$199",
    period: "/month",
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
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="py-20 flex items-center justify-center bg-gradient-to-b from-[#0A0E27] to-[#1A1F3A] animate-in fade-in-50 slide-in-from-bottom-2 duration-500"
    >
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4 text-white">
            Simple, <span className="text-cyan-400">Transparent</span> Pricing
          </h2>
          <p className="text-xl text-white/70 text-balance max-w-2xl mx-auto">
            Choose the perfect plan for your restaurant. All plans include a
            14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative ${
                plan.popular
                  ? "border-primary shadow-lg scale-105"
                  : "border-border"
              }`}
            >
              <Card className="bg-gradient-to-br from-[#1A1F3A]/80 to-[#2D1B4E]/80 border-purple-500/20 backdrop-blur-sm">
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-base text-white/70">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/70">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center space-x-3"
                      >
                        <Check className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                        <span className="text-sm text-white/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-6">
                    <Link href="/auth/register" className="block">
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? "bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white border-0"
                            : "bg-transparent border-purple-500/30 text-white hover:bg-purple-500/20"
                        }`}
                      >
                        Start Free Trial
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
