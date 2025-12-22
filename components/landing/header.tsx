"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/hooks/use-language";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-500/20 bg-gradient-to-b from-[#1A1F3A] to-[#2D1B4E]/95 backdrop-blur supports-[backdrop-filter]:bg-[#1A1F3A]/60 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="mx-auto max-w-7xl w-full px-4 md:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/logo.png"
            alt="NUX"
            width={80}
            height={40}
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-white hover:text-cyan-400 transition-colors px-3 py-2">
              Hamn <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1A1F3A] border-purple-500/20">
              <DropdownMenuItem className="text-white hover:bg-purple-500/20">
                <Link href="#features">Features</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-white hover:text-cyan-400 transition-colors px-3 py-2">
              Pully <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1A1F3A] border-purple-500/20">
              <DropdownMenuItem className="text-white hover:bg-purple-500/20">
                <Link href="#pricing">Pricing</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-white hover:text-cyan-400 transition-colors px-3 py-2">
              Collect <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1A1F3A] border-purple-500/20">
              <DropdownMenuItem className="text-white hover:bg-purple-500/20">
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-white hover:text-cyan-400 transition-colors px-3 py-2">
              Nov Dolet <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1A1F3A] border-purple-500/20">
              <DropdownMenuItem className="text-white hover:bg-purple-500/20">
                <Link href="#contact">Contact</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Link href="#features">
            <Button
              variant="ghost"
              className="text-white hover:text-cyan-400 hover:bg-purple-500/20"
            >
              Features
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white border-0">
              How Now
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            className="text-white hover:bg-purple-500/20"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-purple-500/20 bg-[#1A1F3A]">
          <nav className="container py-4 space-y-4">
            <Link
              href="#features"
              className="block text-white hover:text-cyan-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="block text-white hover:text-cyan-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="block text-white hover:text-cyan-400 transition-colors flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="#contact"
              className="block text-white hover:text-cyan-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="flex flex-col space-y-2 pt-4">
              <Link href="/auth/register">
                <Button className="w-full bg-gradient-to-r from-cyan-400 to-cyan-600">
                  How Now
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
