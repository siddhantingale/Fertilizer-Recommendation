"use client"

import Link from "next/link"
import { Sprout, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage, type Language } from "@/lib/language-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function LandingHeader() {
  const { language, setLanguage, t } = useLanguage()

  const languages = [
    { code: "en" as Language, name: "English", nativeName: "English" },
    { code: "hi" as Language, name: "Hindi", nativeName: "हिंदी" },
    { code: "mr" as Language, name: "Marathi", nativeName: "मराठी" },
  ]

  const currentLanguage = languages.find((lang) => lang.code === language)

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg sm:text-xl">FertilizerPro</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">{currentLanguage?.nativeName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={language === lang.code ? "bg-accent" : ""}
                  >
                    {lang.nativeName}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-sm sm:text-base">
                {t("auth.login")}
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="text-sm sm:text-base">
                {t("auth.signup")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
