"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TestTube } from "lucide-react"
import { WeatherWidget } from "@/components/weather-widget"
import { getUser, getFarmById, saveSoilTest, type SoilTest } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { getWeatherByCoordinates } from "@/lib/weather-service"

export default function SoilTestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [farm, setFarm] = useState<any>(null)
  const initialLoadComplete = useRef(false)
  const [formData, setFormData] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    ph: "",
    organicMatter: "",
    moisture: "",
    temperature: "",
    rainfall: "",
  })

  // Effect 1: Check authentication once on mount
  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }
    setUser(currentUser)
  }, []) // Empty dependency array - runs once on mount

  // Effect 2: Load farm data when farmId changes
  useEffect(() => {
    const farmId = searchParams.get("farmId")

    if (farmId && (!initialLoadComplete.current || farm?.id !== farmId)) {
      const farmData = getFarmById(farmId)
      if (farmData) {
        setFarm(farmData)
        initialLoadComplete.current = true

        const fetchWeather = async () => {
          try {
            const user = getUser()
            if (user?.latitude && user?.longitude) {
              const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${user.latitude}&longitude=${user.longitude}&current=temperature_2m,precipitation&timezone=auto`,
              )
              const data = await response.json()
              if (data.current) {
                setFormData((prev) => ({
                  ...prev,
                  temperature: String(Math.round(data.current.temperature_2m)),
                  rainfall: String(data.current.precipitation || 0),
                }))
              }
            }
          } catch (error) {
            console.log("[v0] Weather fetch error:", error)
          }
        }

        fetchWeather()
      }
    }
  }, [searchParams.get("farmId")])

  useEffect(() => {
    if (farm && user?.latitude && user?.longitude) {
      const fetchWeatherData = async () => {
        const weatherData = await getWeatherByCoordinates(user.latitude, user.longitude)
        if (weatherData) {
          setFormData((prev) => ({
            ...prev,
            temperature: String(weatherData.temperature),
            rainfall: String(weatherData.rainfall || 0),
            moisture: String(weatherData.humidity),
          }))
        }
      }
      fetchWeatherData()
    }
  }, [farm, user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!farm) {
      toast({
        title: "No Farm Selected",
        description: "Please select a farm first",
        variant: "destructive",
      })
      return
    }

    const newTest: SoilTest = {
      id: `test-${Date.now()}`,
      farmId: farm.id,
      testDate: new Date().toISOString(),
      nitrogen: Number.parseFloat(formData.nitrogen),
      phosphorus: Number.parseFloat(formData.phosphorus),
      potassium: Number.parseFloat(formData.potassium),
      ph: Number.parseFloat(formData.ph),
      organicMatter: Number.parseFloat(formData.organicMatter),
      moisture: Number.parseFloat(formData.moisture),
      temperature: Number.parseFloat(formData.temperature),
      rainfall: Number.parseFloat(formData.rainfall),
    }

    saveSoilTest(newTest)

    toast({
      title: "Soil Test Added",
      description: "Your soil test data has been saved successfully",
    })

    router.push(`/results?farmId=${farm.id}&testId=${newTest.id}`)
  }

  if (!user || !farm) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Add Soil Test Data</h1>
            <p className="text-muted-foreground">
              Enter soil analysis results for <span className="font-semibold">{farm.name}</span>
            </p>
          </div>

          <div className="mb-6">
            <WeatherWidget location={farm?.location} />
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center">
                  <TestTube className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>Soil Analysis Data</CardTitle>
              </div>
              <CardDescription>Enter the values from your soil test report</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground">NPK Values</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nitrogen">
                        Nitrogen (kg/ha) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="nitrogen"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 180"
                        value={formData.nitrogen}
                        onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phosphorus">
                        Phosphorus (kg/ha) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phosphorus"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 12"
                        value={formData.phosphorus}
                        onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="potassium">
                        Potassium (kg/ha) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="potassium"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 140"
                        value={formData.potassium}
                        onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground">Soil Properties</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ph">
                        pH Level <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="ph"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 6.5"
                        value={formData.ph}
                        onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organicMatter">
                        Organic Matter (%) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="organicMatter"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 3.2"
                        value={formData.organicMatter}
                        onChange={(e) => setFormData({ ...formData, organicMatter: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="moisture">
                        Moisture (%) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="moisture"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 45"
                        value={formData.moisture}
                        onChange={(e) => setFormData({ ...formData, moisture: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground">Environmental Conditions</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="temperature">
                        Temperature (°C) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 28"
                        value={formData.temperature}
                        onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rainfall">
                        Rainfall (mm/year) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="rainfall"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 1200"
                        value={formData.rainfall}
                        onChange={(e) => setFormData({ ...formData, rainfall: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit">Save & Get Recommendations</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
