"use client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import type { Locale } from "@/lib/i18n"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import i18n from "@/i18n/config"

const languages = {
  en: { name: "English", flag: "🇺🇸" },
  ar: { name: "العربية", flag: "🇸🇦" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  tr: { name: "Türkçe", flag: "🇹🇷" },
}

export function LanguageSwitcher() {
  const { locale: contextLocale, setLocale } = useLanguage()
  const { i18n: i18nInstance } = useTranslation()
  const [mounted, setMounted] = useState(false)
  
  // Get current language from i18n
  const currentLanguage = i18nInstance.language || "en"

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-foreground"
        aria-hidden
        tabIndex={-1}
      >
        <Globe className="h-4 w-4 opacity-0" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 transition-colors text-foreground",
            "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Globe className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([code, { name, flag }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => {
              // Update both systems for compatibility
              setLocale(code as Locale);
              i18n.changeLanguage(code);
              localStorage.setItem("language", code);
              // Dispatch custom event to notify other components
              window.dispatchEvent(new CustomEvent("languagechange", { detail: code }));
            }}
            className={cn(
              "transition-colors",
              currentLanguage === code
                ? "bg-accent text-accent-foreground font-medium"
                : "text-foreground focus:bg-accent focus:text-accent-foreground"
            )}
          >
            <span className="mr-2">{flag}</span>
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
