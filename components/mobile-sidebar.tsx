"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { X, Home, Tractor, Calculator, Leaf, Globe, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getUser, clearUser } from "@/lib/storage"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const user = getUser()
  const { language, setLanguage } = useLanguage()
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/farms", label: "My Farms", icon: Tractor },
    { href: "/calculator", label: "NPK Calculator", icon: Calculator },
    { href: "/disease-scanner", label: "Disease Scanner", icon: Leaf },
  ]

  const handleLogout = () => {
    clearUser()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    })
    onClose()
    router.push("/")
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border z-50 md:hidden overflow-y-auto">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-lg">Menu</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-border">
          <p className="font-semibold text-sm">{user?.name || "User"}</p>
          <p className="text-xs text-muted-foreground">{user?.phone || "No phone"}</p>
          {user?.location && <p className="text-xs text-muted-foreground mt-1">📍 {user.location}</p>}
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={onClose}>
                <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start" size="sm">
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Language Selector */}
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full justify-start bg-transparent"
            size="sm"
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          >
            <Globe className="w-4 h-4 mr-2" />
            Language: {language.toUpperCase()}
          </Button>

          {showLanguageMenu && (
            <div className="mt-2 space-y-1">
              {[
                { code: "en", label: "English" },
                { code: "hi", label: "हिंदी" },
                { code: "mr", label: "मराठी" },
              ].map((lang) => (
                <Button
                  key={lang.code}
                  variant={language === lang.code ? "default" : "ghost"}
                  className="w-full justify-start text-xs"
                  size="sm"
                  onClick={() => {
                    setLanguage(lang.code as "en" | "hi" | "mr")
                    setShowLanguageMenu(false)
                  }}
                >
                  {lang.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <Button variant="destructive" className="w-full justify-start" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </>
  )
}
