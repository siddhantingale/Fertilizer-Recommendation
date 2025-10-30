"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Sprout, Home, Tractor, Calculator, User, LogOut, Menu, Globe, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getUser, clearUser } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { Cloud, CloudRain, Sun } from "lucide-react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { MobileSidebar } from "./mobile-sidebar"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const user = getUser()
  const { language, setLanguage } = useLanguage()
  const [weather, setWeather] = useState<any>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const userProfile = getUser()
        if (!userProfile?.latitude && !userProfile?.longitude) return

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${userProfile.latitude}&longitude=${userProfile.longitude}&current=weather_code,temperature&timezone=auto`,
        )
        const data = await response.json()
        setWeather(data.current)
      } catch (error) {
        console.log("[v0] Weather fetch error:", error)
      }
    }

    fetchWeather()
    const interval = setInterval(fetchWeather, 600000)
    return () => clearInterval(interval)
  }, [])

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

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun className="w-5 h-5 text-yellow-500" />
    if (code === 2 || code === 3) return <Cloud className="w-5 h-5 text-gray-500" />
    if (code >= 45 && code <= 82) return <CloudRain className="w-5 h-5 text-blue-500" />
    return <Cloud className="w-5 h-5 text-gray-400" />
  }

  const handleLogout = () => {
    clearUser()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    })
    router.push("/")
  }

  const handleInstall = async () => {
    if (!installPrompt) return

    try {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      console.log(`[v0] User response to install prompt: ${outcome}`)
      setInstallPrompt(null)
      if (outcome === "accepted") {
        setIsInstalled(true)
        toast({
          title: "App Installed",
          description: "FertilizerPro has been installed successfully!",
        })
      }
    } catch (error) {
      console.log("[v0] Install prompt error:", error)
    }
  }

  const handleIOSInstall = () => {
    alert(
      'To install FertilizerPro on iOS:\n\n1. Tap the Share button (↗️)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"',
    )
  }

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/farms", label: "My Farms", icon: Tractor },
    { href: "/calculator", label: "NPK Calculator", icon: Calculator },
  ]

  return (
    <>
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="hidden sm:inline font-semibold text-lg">FertilizerPro</span>

              {weather && (
                <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
                  {getWeatherIcon(weather.weather_code)}
                  <span className="text-sm font-medium text-foreground hidden md:inline">{weather.temperature}°C</span>
                </div>
              )}
            </Link>

            <div className="flex items-center gap-1">
              {/* Desktop Navigation */}
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`hidden sm:flex ${isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}

              {!isInstalled && (
                <Button
                  onClick={isIOS ? handleIOSInstall : handleInstall}
                  disabled={!installPrompt && !isIOS}
                  size="sm"
                  className="hidden sm:flex gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-xs">Install</span>
                </Button>
              )}

              {/* Language Selector - Desktop */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
                    <Globe className="w-4 h-4" />
                    <span className="text-xs">{language.toUpperCase()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {[
                    { code: "en", label: "English" },
                    { code: "hi", label: "हिंदी" },
                    { code: "mr", label: "मराठी" },
                  ].map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as "en" | "hi" | "mr")}
                      className={language === lang.code ? "bg-primary/10" : ""}
                    >
                      {lang.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">{user?.name || "User"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{user?.name || "User"}</p>
                        <p className="text-xs text-muted-foreground">{user?.phone || "No phone"}</p>
                      </div>
                    </div>
                    {user?.location && (
                      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">📍 {user.location}</div>
                    )}
                  </div>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMobileSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
    </>
  )
}
