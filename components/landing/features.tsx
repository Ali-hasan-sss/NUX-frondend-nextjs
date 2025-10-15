import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  QrCode,
  Users,
  BarChart3,
  Shield,
  Smartphone,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "QR Code Management",
    description:
      "Generate and monitor loyalty point QR codes for seamless customer engagement and tracking.",
  },
  {
    icon: Users,
    title: "Group Management",
    description:
      "Create restaurant groups, send join requests, and collaborate with other establishments.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Track performance, monitor subscriptions, and gain insights with comprehensive dashboards.",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description:
      "Enterprise-grade security with role-based access control and data protection.",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description:
      "Responsive design that works perfectly on all devices for on-the-go management.",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    description:
      "Support for English, Arabic, and German to serve diverse restaurant communities.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="py-20 flex items-center justify-center bg-muted/50 animate-in fade-in-50 slide-in-from-bottom-2 duration-500"
    >
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">
            Everything You Need to <span className="text-primary">Succeed</span>
          </h2>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Powerful features designed specifically for restaurant subscription
            management and customer loyalty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="border-0 shadow-sm hover:shadow-md transition-shadow"
            >
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
