"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sprout, Phone, Lock } from "lucide-react"
import { saveUser, getProfileByPhone } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

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
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [displayOtp, setDisplayOtp] = useState("") // Add state to display OTP in block

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setTimeout(() => {
      const generated = Math.floor(100000 + Math.random() * 900000).toString()
      setOtpForPhone(phone, generated)
      setDisplayOtp(generated) // Store OTP to display in block
      setOtpSent(true)
      setLoading(false)
      toast({
        title: "OTP Sent",
        description: `Your OTP is displayed below. It expires in 5 minutes.`,
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
          title: "OTP invalid",
          description: "OTP is missing or expired. Please request a new one.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }
      if (otp !== expected) {
        toast({
          title: "Incorrect OTP",
          description: "The OTP you entered is incorrect.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // OTP correct — clear it and proceed to login
      sessionStorage.removeItem(`otp:${phone}`)

      const profile = getProfileByPhone(phone)
      if (!profile) {
        toast({
          title: "Account not found",
          description: "Please sign up first with this mobile number.",
          variant: "destructive",
        })
        setLoading(false)
        router.push("/auth/signup")
        return
      }

      const user = { id: profile.id, phone: profile.phone, name: profile.name }
      saveUser(user)
      toast({ title: "Login Successful", description: "Welcome to FertilizerPro!" })
      router.push("/dashboard")
    }, 600)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-xl">
              <Sprout className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to FertilizerPro</CardTitle>
          <CardDescription>Login with your mobile number</CardDescription>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">Your OTP:</p>
                <p className="text-4xl font-bold text-primary tracking-widest">{displayOtp}</p>
                <p className="text-xs text-muted-foreground mt-2">Expires in 5 minutes</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  We've sent an OTP to your number. It expires in 5 minutes.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setOtpSent(false)}>
                Change Number
              </Button>
            </form>
          )}
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
