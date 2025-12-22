import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#1A1F3A] to-[#2D1B4E] flex items-center justify-center animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-6 text-white">
            Ready to Transform Your Restaurant Business?
          </h2>
          <p className="text-xl text-white/80 text-balance mb-8">
            Join hundreds of restaurants already using NUX to build
            customer loyalty and streamline their operations. Start your free
            trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="text-lg px-8 bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white border-0"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#contact">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 border-purple-500/30 text-white hover:bg-purple-500/20 bg-transparent"
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
