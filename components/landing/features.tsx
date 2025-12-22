"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KeyRound, Users, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Features() {
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

  const features = [
    {
      icon: KeyRound,
      title: t("landing.features.purchase.title"),
      description: t("landing.features.purchase.description"),
      profile: {
        name: "PLAN Sioad",
        image: "/placeholder-user.jpg",
      },
      gradient: "from-purple-500/20 to-purple-700/20",
      iconColor: "text-purple-400",
    },
    {
      icon: Users,
      title: t("landing.features.earnPoints.title"),
      description: t("landing.features.earnPoints.description"),
      profile: {
        name: "Sone",
        image: "/placeholder-user.jpg",
      },
      gradient: "from-pink-500/20 to-pink-700/20",
      iconColor: "text-pink-400",
    },
    {
      icon: Star,
      title: t("landing.features.trustSupport.title"),
      description: t("landing.features.trustSupport.description"),
      profile: {
        name: "Paly Soan",
        image: "/placeholder-user.jpg",
      },
      gradient: "from-cyan-500/20 to-cyan-700/20",
      iconColor: "text-cyan-400",
    },
  ];

  return (
    <section
      id="features"
      className={cn(
        "py-20 flex items-center justify-center animate-in fade-in-50 slide-in-from-bottom-2 duration-500 transition-colors",
        isDark
          ? "bg-gradient-to-b from-[#1A1F3A] to-[#0A0E27]"
          : "bg-gradient-to-b from-gray-100 to-white"
      )}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className={cn(
              "text-4xl lg:text-5xl font-bold mb-4",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {t("landing.features.title")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card
                className={cn(
                  "backdrop-blur-sm shadow-lg hover:shadow-cyan-500/20 transition-all duration-300",
                  isDark
                    ? "bg-gradient-to-br from-[#1A1F3A]/80 to-[#2D1B4E]/80 border-purple-500/20"
                    : "bg-white/90 border-gray-200"
                )}
              >
                <CardHeader>
                  <div
                    className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 border ${
                      isDark ? "border-purple-500/30" : "border-purple-200"
                    }`}
                  >
                    <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                  </div>
                  <CardTitle
                    className={cn(
                      "text-2xl",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription
                    className={cn(
                      "text-base leading-relaxed mb-6",
                      isDark ? "text-white/70" : "text-gray-600"
                    )}
                  >
                    {feature.description}
                  </CardDescription>
                  <div
                    className={cn(
                      "flex items-center gap-3 pt-4 border-t",
                      isDark ? "border-purple-500/20" : "border-gray-200"
                    )}
                  >
                    <div
                      className={cn(
                        "relative w-10 h-10 rounded-full overflow-hidden border-2",
                        isDark ? "border-purple-500/30" : "border-purple-200"
                      )}
                    >
                      <Image
                        src={feature.profile.image}
                        alt={feature.profile.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isDark ? "text-white/80" : "text-gray-700"
                      )}
                    >
                      {feature.profile.name}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mt-12">
          {features.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === 1
                  ? "w-8 bg-cyan-400"
                  : isDark
                  ? "w-2 bg-white/30 hover:bg-white/50"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
