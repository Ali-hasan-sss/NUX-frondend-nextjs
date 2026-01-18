"use client";

import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { I18nProvider } from "@/components/client/i18n-provider";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ContactPage() {
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
        <ContactContent />
        <Footer />
      </div>
    </I18nProvider>
  );
}

function ContactContent() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark" || theme === "system";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    alert(t("landing.contact.form.submitMessage") || "Thank you! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: t("landing.contact.info.email.title") || "Email",
      description:
        t("landing.contact.info.email.description") ||
        "Send us an email anytime!",
      value: "support@nux.com",
    },
    {
      icon: Phone,
      title: t("landing.contact.info.phone.title") || "Phone",
      description:
        t("landing.contact.info.phone.description") ||
        "Mon-Fri from 9am to 6pm",
      value: "+1 (555) 123-4567",
    },
    {
      icon: MapPin,
      title: t("landing.contact.info.address.title") || "Address",
      description:
        t("landing.contact.info.address.description") ||
        "Visit our office",
      value: t("landing.contact.info.address.value") || "123 Business St, City, Country",
    },
    {
      icon: Clock,
      title: t("landing.contact.info.hours.title") || "Business Hours",
      description:
        t("landing.contact.info.hours.description") ||
        "We're here to help",
      value: t("landing.contact.info.hours.value") || "Mon-Fri: 9:00 AM - 6:00 PM",
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
              {t("landing.contact.title") || "Contact Us"}
            </h1>
            <p
              className={cn(
                "text-lg md:text-xl mb-8 max-w-2xl mx-auto",
                isDark ? "text-gray-300" : "text-gray-600"
              )}
            >
              {t("landing.contact.subtitle") ||
                "Get in touch with our team. We're here to help your restaurant succeed."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    "h-full transition-all duration-300 hover:shadow-xl text-center",
                    isDark
                      ? "bg-[#1A1F3A] border-purple-500/20 hover:border-purple-500/40"
                      : "bg-white border-gray-200 hover:border-cyan-300 hover:shadow-cyan-100"
                  )}
                >
                  <CardHeader>
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto",
                        isDark
                          ? "bg-purple-500/20"
                          : "bg-cyan-100"
                      )}
                    >
                      <info.icon
                        className={cn(
                          "h-6 w-6",
                          isDark ? "text-cyan-400" : "text-cyan-600"
                        )}
                      />
                    </div>
                    <CardTitle
                      className={cn(
                        "text-lg",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      {info.title}
                    </CardTitle>
                    <CardDescription
                      className={cn(
                        "text-sm mb-2",
                        isDark ? "text-gray-300" : "text-gray-600"
                      )}
                    >
                      {info.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p
                      className={cn(
                        "font-medium",
                        isDark ? "text-cyan-400" : "text-cyan-600"
                      )}
                    >
                      {info.value}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card
              className={cn(
                "transition-all duration-300",
                isDark
                  ? "bg-[#1A1F3A] border-purple-500/20"
                  : "bg-white border-gray-200"
              )}
            >
              <CardHeader>
                <CardTitle
                  className={cn(
                    "text-2xl md:text-3xl",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  {t("landing.contact.form.title") || "Send Us a Message"}
                </CardTitle>
                <CardDescription
                  className={cn(
                    "text-base",
                    isDark ? "text-gray-300" : "text-gray-600"
                  )}
                >
                  {t("landing.contact.form.description") ||
                    "Fill out the form below and we'll get back to you as soon as possible."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className={cn(
                          isDark ? "text-gray-300" : "text-gray-700"
                        )}
                      >
                        {t("landing.contact.form.name") || "Name"}
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className={cn(
                          isDark
                            ? "bg-[#0A0E27] border-purple-500/30 text-white"
                            : "bg-white border-gray-300"
                        )}
                        placeholder={
                          t("landing.contact.form.namePlaceholder") ||
                          "Your name"
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className={cn(
                          isDark ? "text-gray-300" : "text-gray-700"
                        )}
                      >
                        {t("landing.contact.form.email") || "Email"}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className={cn(
                          isDark
                            ? "bg-[#0A0E27] border-purple-500/30 text-white"
                            : "bg-white border-gray-300"
                        )}
                        placeholder={
                          t("landing.contact.form.emailPlaceholder") ||
                          "your.email@example.com"
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="subject"
                      className={cn(
                        isDark ? "text-gray-300" : "text-gray-700"
                      )}
                    >
                      {t("landing.contact.form.subject") || "Subject"}
                    </Label>
                    <Input
                      id="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className={cn(
                        isDark
                          ? "bg-[#0A0E27] border-purple-500/30 text-white"
                          : "bg-white border-gray-300"
                      )}
                      placeholder={
                        t("landing.contact.form.subjectPlaceholder") ||
                        "How can we help?"
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="message"
                      className={cn(
                        isDark ? "text-gray-300" : "text-gray-700"
                      )}
                    >
                      {t("landing.contact.form.message") || "Message"}
                    </Label>
                    <Textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className={cn(
                        isDark
                          ? "bg-[#0A0E27] border-purple-500/30 text-white"
                          : "bg-white border-gray-300"
                      )}
                      placeholder={
                        t("landing.contact.form.messagePlaceholder") ||
                        "Tell us about your inquiry..."
                      }
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white border-0 shadow-lg shadow-cyan-500/30"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {t("landing.contact.form.submit") || "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
