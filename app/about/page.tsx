"use client";

import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { I18nProvider } from "@/components/client/i18n-provider";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Target, Users, Award, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AboutPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark" || theme === "system";

  return (
    <I18nProvider>
      <div
        className={cn(
          "min-h-screen transition-colors duration-300",
          isDark
            ? "bg-gradient-to-b from-[#0A0E27] via-[#1A1F3A] to-[#2D1B4E]"
            : "bg-gradient-to-b from-gray-50 via-white to-gray-100"
        )}
      >
        <Header />
        <AboutContent />
        <Footer />
      </div>
    </I18nProvider>
  );
}

function AboutContent() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark" || theme === "system";

  const values = [
    {
      icon: Target,
      title: t("landing.about.mission.title") || "Our Mission",
      description:
        t("landing.about.mission.description") ||
        "To revolutionize restaurant loyalty programs by providing innovative, automated solutions that help restaurants build lasting relationships with their customers.",
    },
    {
      icon: Users,
      title: t("landing.about.vision.title") || "Our Vision",
      description:
        t("landing.about.vision.description") ||
        "To become the leading platform for restaurant loyalty management, empowering businesses to create exceptional customer experiences through technology.",
    },
    {
      icon: Award,
      title: t("landing.about.excellence.title") || "Excellence",
      description:
        t("landing.about.excellence.description") ||
        "We are committed to delivering top-quality solutions that meet the highest standards of performance, reliability, and user experience.",
    },
    {
      icon: Zap,
      title: t("landing.about.innovation.title") || "Innovation",
      description:
        t("landing.about.innovation.description") ||
        "Continuously improving and evolving our platform with cutting-edge technology to provide restaurants with the best tools for customer engagement.",
    },
  ];

  return (
    <main className=" pb-16">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        {/* Dynamic gradient background */}
        <div
          className={cn(
            "absolute inset-0 transition-colors duration-300",
            isDark
              ? "bg-gradient-to-br from-[#0A0E27] via-[#1A1F3A] to-[#2D1B4E]"
              : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
          )}
        />

        {/* Animated glowing particles and lines */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -80, 0],
              y: [0, -40, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-full blur-3xl"
          />
          {/* Glowing lines effect */}
          <div className="absolute top-0 left-0 w-full h-full">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 30,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border border-cyan-500/20 rounded-full -translate-x-1/2 -translate-y-1/2"
            />
            <motion.div
              animate={{
                rotate: [360, 0],
                scale: [1.2, 1, 1.2],
              }}
              transition={{
                duration: 25,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="absolute top-1/2 left-1/2 w-[400px] h-[400px] border border-pink-500/20 rounded-full -translate-x-1/2 -translate-y-1/2"
            />
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1
              className={cn(
                "text-4xl md:text-5xl lg:text-6xl font-bold mb-6",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {t("landing.about.title") || "About NUX"}
            </h1>
            <p
              className={cn(
                "text-lg md:text-xl mb-8 max-w-2xl mx-auto",
                isDark ? "text-gray-300" : "text-gray-600"
              )}
            >
              {t("landing.about.subtitle") ||
                "Empowering restaurants with intelligent loyalty solutions"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* About Story */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn(
              "prose prose-lg max-w-none",
              isDark ? "prose-invert" : ""
            )}
          >
            <p
              className={cn(
                "text-lg leading-relaxed mb-6",
                isDark ? "text-gray-300" : "text-gray-700"
              )}
            >
              {t("landing.about.story.p1") ||
                "NUX was founded with a clear mission: to transform how restaurants engage with their customers through innovative loyalty programs. We understand that in today's competitive market, restaurants need more than just great food—they need powerful tools to build customer loyalty and drive repeat business."}
            </p>
            <p
              className={cn(
                "text-lg leading-relaxed mb-6",
                isDark ? "text-gray-300" : "text-gray-700"
              )}
            >
              {t("landing.about.story.p2") ||
                "Our platform provides restaurants with automated loyalty management, QR code solutions, customer analytics, and comprehensive tools to track and reward customer engagement. With NUX, restaurants can create personalized experiences that keep customers coming back."}
            </p>
            <p
              className={cn(
                "text-lg leading-relaxed",
                isDark ? "text-gray-300" : "text-gray-700"
              )}
            >
              {t("landing.about.story.p3") ||
                "We are dedicated to helping restaurants succeed by providing technology that is not only powerful but also easy to use, ensuring that businesses of all sizes can leverage the benefits of modern loyalty programs."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2
              className={cn(
                "text-3xl md:text-4xl font-bold mb-4",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {t("landing.about.values.title") || "Our Values"}
            </h2>
            <p
              className={cn(
                "text-lg max-w-2xl mx-auto",
                isDark ? "text-gray-300" : "text-gray-600"
              )}
            >
              {t("landing.about.values.subtitle") ||
                "The principles that guide everything we do"}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              >
                <Card
                  className={cn(
                    "h-full transition-all duration-300 hover:shadow-xl",
                    isDark
                      ? "bg-[#1A1F3A] border-purple-500/20 hover:border-purple-500/40"
                      : "bg-white border-gray-200 hover:border-cyan-300 hover:shadow-cyan-100"
                  )}
                >
                  <CardHeader>
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                        isDark
                          ? "bg-purple-500/20"
                          : "bg-cyan-100"
                      )}
                    >
                      <value.icon
                        className={cn(
                          "h-6 w-6",
                          isDark ? "text-cyan-400" : "text-cyan-600"
                        )}
                      />
                    </div>
                    <CardTitle
                      className={cn(
                        "text-xl",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription
                      className={cn(
                        "text-base leading-relaxed",
                        isDark ? "text-gray-300" : "text-gray-600"
                      )}
                    >
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
