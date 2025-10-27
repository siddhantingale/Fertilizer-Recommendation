"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, TrendingUp, AlertCircle, Download } from "lucide-react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import {
  getUser,
  getFarmById,
  getSoilTests,
  type Farm,
  type SoilTest,
  type FertilizerRecommendation,
} from "@/lib/storage"
import jsPDF from "jspdf"
import { calculateMLRecommendations } from "@/lib/ml-recommendation-engine"
import { getWeatherByCoordinates } from "@/lib/weather-service"

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [farm, setFarm] = useState<Farm | null>(null)
  const [soilTest, setSoilTest] = useState<SoilTest | null>(null)
  const [recommendations, setRecommendations] = useState<FertilizerRecommendation[]>([])

  const farmId = searchParams.get("farmId")
  const testId = searchParams.get("testId")
  const loadedRef = useRef(false)

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }
    setUser(currentUser)
  }, [])

  useEffect(() => {
    if (!farmId || !testId || loadedRef.current) return

    const farmData = getFarmById(farmId)
    if (!farmData) {
      router.push("/calculator")
      return
    }

    const tests = getSoilTests()
    const testData = tests.find((t) => t.id === testId)
    if (!testData) {
      router.push("/calculator")
      return
    }

    const fetchAndCalculate = async () => {
      let weatherData = undefined
      if (user?.latitude && user?.longitude) {
        weatherData = await getWeatherByCoordinates(user.latitude, user.longitude)
      }
      const recs = calculateMLRecommendations(testData, farmData.cropType, weatherData)
      setFarm(farmData)
      setSoilTest(testData)
      setRecommendations(recs)
      loadedRef.current = true
    }

    fetchAndCalculate()
  }, [farmId, testId, user])

  const handleExportPDF = () => {
    if (!farm || !soilTest || recommendations.length === 0) return

    const doc = new jsPDF()
    let yPosition = 20

    // Title
    doc.setFontSize(18)
    doc.text("Fertilizer Recommendations Report", 20, yPosition)
    yPosition += 10

    // Farm & Soil Summary
    doc.setFontSize(12)
    doc.text("Farm & Soil Information", 20, yPosition)
    yPosition += 8

    doc.setFontSize(10)
    const summaryData = [
      `Farm Name: ${farm.name}`,
      `Soil Type: ${farm.soilType}`,
      `Location: ${farm.location}`,
      `Area: ${farm.area} acres`,
      `pH Level: ${soilTest.ph}`,
      `Nitrogen: ${soilTest.nitrogen} kg/ha`,
      `Phosphorus: ${soilTest.phosphorus} kg/ha`,
      `Potassium: ${soilTest.potassium} kg/ha`,
      `Test Date: ${new Date(soilTest.testDate).toLocaleDateString()}`,
    ]

    summaryData.forEach((line) => {
      doc.text(line, 20, yPosition)
      yPosition += 6
    })

    yPosition += 5

    // Recommendations
    doc.setFontSize(12)
    doc.text("Top Fertilizer Recommendations", 20, yPosition)
    yPosition += 8

    recommendations.forEach((rec, index) => {
      doc.setFontSize(11)
      doc.text(`${index + 1}. ${rec.name} (${rec.npkRatio})`, 20, yPosition)
      yPosition += 6

      doc.setFontSize(9)
      doc.text(`Dosage: ${rec.dosage}`, 25, yPosition)
      yPosition += 5
      doc.text(`Application: ${rec.applicationMethod}`, 25, yPosition)
      yPosition += 5
      doc.text(`Match Score: ${rec.score}/100`, 25, yPosition)
      yPosition += 5

      doc.text("Benefits:", 25, yPosition)
      yPosition += 4
      rec.benefits.slice(0, 3).forEach((benefit) => {
        doc.text(`• ${benefit}`, 30, yPosition)
        yPosition += 4
      })

      yPosition += 3

      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }
    })

    // Footer
    yPosition += 5
    doc.setFontSize(8)
    doc.text(`Generated on ${new Date().toLocaleString()}`, 20, yPosition)

    // Save PDF
    doc.save(`FertilizerReport_${farm.name}_${new Date().toISOString().split("T")[0]}.pdf`)
  }

  if (!user || !farm || !soilTest || recommendations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading recommendations...</p>
        </div>
      </div>
    )
  }

  const chartData = recommendations.map((rec) => ({
    name: rec.name.split(" ")[0], // Shortened name for chart
    N: rec.nitrogen,
    P: rec.phosphorus,
    K: rec.potassium,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Leaf className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-balance">Fertilizer Recommendations</h1>
                  <p className="text-muted-foreground">Based on your soil analysis and environmental conditions</p>
                </div>
              </div>
              <Button onClick={handleExportPDF} className="gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export PDF</span>
              </Button>
            </div>
          </div>

          <div id="recommendations-report" className="space-y-6">
            {/* Farm & Soil Summary */}
            <Card className="bg-card border-primary/20">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Farm</p>
                    <p className="font-semibold">{farm.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Soil Type</p>
                    <p className="font-semibold">{farm.soilType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">pH Level</p>
                    <p className="font-semibold">{soilTest.ph}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">N-P-K (kg/ha)</p>
                    <p className="font-semibold">
                      {soilTest.nitrogen}-{soilTest.phosphorus}-{soilTest.potassium}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Test Date</p>
                    <p className="font-semibold">{new Date(soilTest.testDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Top Recommendations
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {recommendations.map((rec, index) => (
                <Card key={rec.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{rec.name}</CardTitle>
                        <CardDescription>{rec.npkRatio}</CardDescription>
                      </div>
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        {index === 0 ? "Best Match" : `#${index + 1}`}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Dosage</p>
                      <p className="text-sm text-muted-foreground">{rec.dosage}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Application Method</p>
                      <p className="text-sm text-muted-foreground">{rec.applicationMethod}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Benefits</p>
                      <ul className="space-y-1">
                        {rec.benefits.slice(0, 3).map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-2">NPK Composition</p>
                      <div className="flex gap-4 text-sm">
                        {rec.nitrogen > 0 && (
                          <div>
                            <span className="text-muted-foreground">N:</span>{" "}
                            <span className="font-semibold text-chart-1">{rec.nitrogen}%</span>
                          </div>
                        )}
                        {rec.phosphorus > 0 && (
                          <div>
                            <span className="text-muted-foreground">P:</span>{" "}
                            <span className="font-semibold text-chart-2">{rec.phosphorus}%</span>
                          </div>
                        )}
                        {rec.potassium > 0 && (
                          <div>
                            <span className="text-muted-foreground">K:</span>{" "}
                            <span className="font-semibold text-chart-3">{rec.potassium}%</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Match Score: <span className="font-semibold text-foreground">{rec.score}/100</span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* NPK Comparison Chart */}
          <Card className="shadow-md mb-8">
            <CardHeader>
              <CardTitle>NPK Composition Comparison</CardTitle>
              <CardDescription>Visual comparison of nutrient levels in recommended fertilizers</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis label={{ value: "Percentage (%)", angle: -90, position: "insideLeft" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="N" fill="#22c55e" name="Nitrogen" />
                  <Bar dataKey="P" fill="#f97316" name="Phosphorus" />
                  <Bar dataKey="K" fill="#a855f7" name="Potassium" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculator">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                New Calculation
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
