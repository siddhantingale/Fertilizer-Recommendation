"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUser } from "@/lib/storage"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/auth/signup")
    }
  }, []) // removed [router] to avoid effect re-trigger

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="text-center space-y-4">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
