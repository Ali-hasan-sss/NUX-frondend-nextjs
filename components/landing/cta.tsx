import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20 bg-primary text-primary-foreground flex items-center justify-center animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-6">
            Ready to Transform Your Restaurant Business?
          </h2>
          <p className="text-xl text-primary-foreground/90 text-balance mb-8">
            Join hundreds of restaurants already using RestaurantHub to build
            customer loyalty and streamline their operations. Start your free
            trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#contact">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
              >
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
