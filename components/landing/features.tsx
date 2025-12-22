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

const features = [
  {
    icon: KeyRound,
    title: "Purchase",
    description:
      "Automated points, loyalty tracking and secure transactions. Manage your rewards effortlessly.",
    profile: {
      name: "PLAN Sioad",
      image: "/placeholder-user.jpg",
    },
    gradient: "from-purple-500/20 to-purple-700/20",
    iconColor: "text-purple-400",
  },
  {
    icon: Users,
    title: "Earn points",
    description:
      "Digital rewards and vouchers for memorable experiences. Collect points with every purchase.",
    profile: {
      name: "Sone",
      image: "/placeholder-user.jpg",
    },
    gradient: "from-pink-500/20 to-pink-700/20",
    iconColor: "text-pink-400",
  },
  {
    icon: Star,
    title: "Trust & Support",
    description:
      "Earn rewards daily, points and support for cafes & restaurants. Build lasting customer relationships.",
    profile: {
      name: "Paly Soan",
      image: "/placeholder-user.jpg",
    },
    gradient: "from-cyan-500/20 to-cyan-700/20",
    iconColor: "text-cyan-400",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="py-20 flex items-center justify-center bg-gradient-to-b from-[#1A1F3A] to-[#0A0E27] animate-in fade-in-50 slide-in-from-bottom-2 duration-500"
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Earn. Collect. Enjoy.
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
              <Card className="bg-gradient-to-br from-[#1A1F3A]/80 to-[#2D1B4E]/80 border-purple-500/20 backdrop-blur-sm shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
                <CardHeader>
                  <div
                    className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 border border-purple-500/30`}
                  >
                    <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                  </div>
                  <CardTitle className="text-2xl text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/70 text-base leading-relaxed mb-6">
                    {feature.description}
                  </CardDescription>
                  <div className="flex items-center gap-3 pt-4 border-t border-purple-500/20">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500/30">
                      <Image
                        src={feature.profile.image}
                        alt={feature.profile.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm text-white/80 font-medium">
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
              className={`h-2 rounded-full transition-all duration-300 ${
                index === 1
                  ? "w-8 bg-cyan-400"
                  : "w-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
