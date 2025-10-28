"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sprout, Phone, User, ArrowLeft } from "lucide-react"
import { saveProfile, getProfileByPhone, saveUser } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t, language } = useLanguage()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length !== 10) {
      toast({
        title: t("auth.invalidPhone") || "Invalid Phone Number",
        description: t("auth.invalidPhoneDesc") || "Please enter a valid 10-digit phone number",
        variant: "destructive",
      })
      return
    }
    if (!name.trim()) {
      toast({
        title: t("auth.nameRequired") || "Name Required",
        description: t("auth.nameRequiredDesc") || "Please enter your name",
        variant: "destructive",
      })
      return
    }
    setLoading(true)

    const existing = getProfileByPhone(phone)
    if (existing) {
      saveUser({
        id: existing.id,
        name: existing.name,
        phone: existing.phone,
        language: language,
      })
      toast({
        title: t("auth.mobileExists") || "Mobile number already exists",
        description: t("auth.autoLogin") || "You are logged in automatically.",
      })
      setLoading(false)
      router.push("/dashboard")
      return
    }

    const profile = {
      id: `user-${Date.now()}`,
      phone,
      name,
      language: language,
    }
    saveProfile(profile)
    toast({
      title: t("auth.accountCreated") || "Account Created",
      description: t("auth.accountCreatedDesc") || "Your profile has been saved. Please login to continue.",
    })
    setLoading(false)
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Button variant="ghost" size="sm" className="absolute top-4 left-4" onClick={() => router.push("/")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t("auth.backToHome")}
      </Button>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-xl">
              <Sprout className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl">{t("auth.createAccount")}</CardTitle>
          <CardDescription>{t("auth.signupDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("auth.fullName")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder={t("auth.enterName")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("auth.mobileNumber")}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t("auth.enterMobile")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("auth.creating") : t("auth.createAccount")}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {t("auth.alreadyAccount")}{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              {t("auth.login")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
