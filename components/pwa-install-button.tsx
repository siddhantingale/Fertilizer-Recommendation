"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PWAInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isIOSDevice)

    // Listen for PWA install prompt
    const handlePWAInstallable = (e: any) => {
      setInstallPrompt(e.detail.prompt)
    }

    window.addEventListener("pwa-installable", handlePWAInstallable)

    return () => {
      window.removeEventListener("pwa-installable", handlePWAInstallable)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return

    try {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      console.log(`[v0] User response to install prompt: ${outcome}`)
      setInstallPrompt(null)
    } catch (error) {
      console.log("[v0] Install prompt error:", error)
    }
  }

  // Don't show button if already installed
  if (isInstalled) {
    return null
  }

  // For iOS, show instructions instead of button
  if (isIOS) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-2 bg-transparent"
        onClick={() => {
          alert(
            'To install FertilizerPro on iOS:\n\n1. Tap the Share button (↗️)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"',
          )
        }}
      >
        <Download className="w-4 h-4" />
        Install App
      </Button>
    )
  }

  // For Android, show install button if prompt is available
  if (installPrompt) {
    return (
      <Button onClick={handleInstall} className="gap-2 bg-green-600 hover:bg-green-700">
        <Download className="w-4 h-4" />
        Install App
      </Button>
    )
  }

  return null
}
