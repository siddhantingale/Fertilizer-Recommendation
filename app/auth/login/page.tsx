"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sprout, Phone, Lock, ArrowLeft } from "lucide-react"
import { saveUser, getProfileByPhone } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"

const OTP_TTL_MS = 5 * 60 * 1000

function setOtpForPhone(phone: string, otp: string) {
  try {
    const payload = { otp, exp: Date.now() + OTP_TTL_MS }
    sessionStorage.setItem(`otp:${phone}`, JSON.stringify(payload))
  } catch {}
}

function getOtpForPhone(phone: string): string | null {
  try {
    const raw = sessionStorage.getItem(`otp:${phone}`)
    if (!raw) return null
    const data = JSON.parse(raw) as { otp: string; exp: number }
    if (!data?.otp || !data?.exp || Date.now() > data.exp) {
      sessionStorage.removeItem(`otp:${phone}`)
      return null
    }
    return data.otp
  } catch {
    sessionStorage.removeItem(`otp:${phone}`)
    return null
  }
}

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t, setLanguage } = useLanguage()
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [displayOtp, setDisplayOtp] = useState("")

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length !== 10) {
      toast({
        title: t("auth.invalidPhone") || "Invalid Phone Number",
        description: t("auth.invalidPhoneDesc") || "Please enter a valid 10-digit phone number",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setTimeout(() => {
      const generated = Math.floor(100000 + Math.random() * 900000).toString()
      setOtpForPhone(phone, generated)
      setDisplayOtp(generated)
      setOtpSent(true)
      setLoading(false)
      toast({
        title: t("auth.otpSent") || "OTP Sent",
        description: t("auth.otpSentDesc") || "Your OTP is displayed below. It expires in 5 minutes.",
      })
    }, 600)
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      const expected = getOtpForPhone(phone)
      if (!expected) {
        toast({
          title: t("auth.otpInvalid") || "OTP invalid",
          description: t("auth.otpInvalidDesc") || "OTP is missing or expired. Please request a new one.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }
      if (otp !== expected) {
        toast({
          title: t("auth.incorrectOTP") || "Incorrect OTP",
          description: t("auth.incorrectOTPDesc") || "The OTP you entered is incorrect.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      sessionStorage.removeItem(`otp:${phone}`)

      const profile = getProfileByPhone(phone)
      if (!profile) {
        toast({
          title: t("auth.accountNotFound") || "Account not found",
          description: t("auth.accountNotFoundDesc") || "Please sign up first with this mobile number.",
          variant: "destructive",
        })
        setLoading(false)
        router.push("/auth/signup")
        return
      }

      if (profile.language) {
        setLanguage(profile.language as any)
      }

      const user = { id: profile.id, phone: profile.phone, name: profile.name, language: profile.language }
      saveUser(user)
      toast({
        title: t("auth.loginSuccess") || "Login Successful",
        description: t("auth.welcome") || "Welcome to FertilizerPro!",
      })
      router.push("/dashboard")
    }, 600)
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
          <CardTitle className="text-2xl">{t("auth.welcome")}</CardTitle>
          <CardDescription>{t("auth.loginDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
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
                {loading ? t("auth.sendingOTP") || "Sending OTP..." : t("auth.sendOTP")}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">{t("auth.yourOTP")}</p>
                <p className="text-4xl font-bold text-primary tracking-widest">{displayOtp}</p>
                <p className="text-xs text-muted-foreground mt-2">{t("auth.expiresIn")}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">{t("auth.enterOTP")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder={t("auth.enter6DigitOTP") || "Enter 6-digit OTP"}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("auth.verifying") || "Verifying..." : t("auth.verifyOTP")}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setOtpSent(false)}>
                {t("auth.changeNumber")}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center text-sm">
            {t("auth.noAccount")}{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              {t("auth.signup")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
