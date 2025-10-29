"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Tractor, TrendingUp, Sprout, ArrowRight, Leaf } from "lucide-react"
import { getUser, getFarmsByUser, getSoilTestsByUser } from "@/lib/storage"
import { useLanguage } from "@/lib/language-context"

export default function DashboardPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalFarms: 0,
    recommendations: 0,
    sustainability: 8.2,
  })

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }
    setUser(currentUser)

    const farms = getFarmsByUser(currentUser.id)
    const tests = getSoilTestsByUser(currentUser.id)
    setStats({
      totalFarms: farms.length,
      recommendations: tests.length,
      sustainability: 8.2,
    })
  }, [])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Welcome Section */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your farms and optimize fertilizer usage for sustainable agriculture.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Farms</CardTitle>
              <Tractor className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFarms}</div>
              <p className="text-xs text-muted-foreground">Registered farms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
              <Calculator className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recommendations}</div>
              <p className="text-xs text-muted-foreground">Fertilizer recommendations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sustainability</CardTitle>
              <TrendingUp className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sustainability}/10</div>
              <p className="text-xs text-muted-foreground">Average score</p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">NPK Calculator</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Calculate optimal fertilizer recommendations based on soil analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/calculator">
                <Button className="w-full text-sm">
                  Start Calculation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Tractor className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle className="text-lg">Manage Farms</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                View and manage your registered farms and their details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/farms">
                <Button variant="outline" className="w-full text-sm bg-transparent">
                  View Farms
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-primary/20">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Disease Scanner</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Scan crop leaves to detect diseases and get instant treatment recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/disease-scanner">
                <Button className="w-full text-sm bg-primary">
                  Scan Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Get Started Section */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Sprout className="w-5 h-5 text-primary" />
              <CardTitle>Get Started</CardTitle>
            </div>
            <CardDescription>Start your sustainable farming journey in 3 simple steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">
                1
              </div>
              <div>
                <h4 className="font-semibold text-sm md:text-base mb-1">Register Your Farm</h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Add your farm details including location, crop type, and area
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">
                2
              </div>
              <div>
                <h4 className="font-semibold text-sm md:text-base mb-1">Conduct Soil Test</h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Input your soil analysis data for accurate recommendations
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">
                3
              </div>
              <div>
                <h4 className="font-semibold text-sm md:text-base mb-1">Get Recommendations</h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Receive personalized fertilizer suggestions for optimal yield
                </p>
              </div>
            </div>

            <Link href="/farms">
              <Button className="w-full mt-4 text-sm">
                Register Your First Farm
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
