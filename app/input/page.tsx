"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"

export default function InputPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    soilType: "",
    pH: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    temperature: "",
    rainfall: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Save to localStorage
    localStorage.setItem("fertilizerProData", JSON.stringify(formData))

    // Navigate to results
    router.push("/results")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isFormValid = () => {
    return Object.values(formData).every((value) => value !== "")
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl text-balance">Enter Soil and Crop Details</CardTitle>
            <CardDescription className="text-base">
              Provide accurate soil test results and environmental data for personalized fertilizer recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Soil Type */}
              <div className="space-y-2">
                <Label htmlFor="soilType">Soil Type</Label>
                <Select value={formData.soilType} onValueChange={(value) => handleInputChange("soilType", value)}>
                  <SelectTrigger id="soilType">
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clay">Clay</SelectItem>
                    <SelectItem value="sandy">Sandy</SelectItem>
                    <SelectItem value="loamy">Loamy</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Soil pH */}
              <div className="space-y-2">
                <Label htmlFor="pH">Soil pH</Label>
                <Input
                  id="pH"
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  placeholder="e.g., 6.5"
                  value={formData.pH}
                  onChange={(e) => handleInputChange("pH", e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Normal range: 5.5 - 8.0</p>
              </div>

              {/* NPK Values */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nitrogen">Nitrogen (N)</Label>
                  <Input
                    id="nitrogen"
                    type="number"
                    min="0"
                    placeholder="kg/ha"
                    value={formData.nitrogen}
                    onChange={(e) => handleInputChange("nitrogen", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Normal: 200-300</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phosphorus">Phosphorus (P)</Label>
                  <Input
                    id="phosphorus"
                    type="number"
                    min="0"
                    placeholder="kg/ha"
                    value={formData.phosphorus}
                    onChange={(e) => handleInputChange("phosphorus", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Normal: 40-60</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="potassium">Potassium (K)</Label>
                  <Input
                    id="potassium"
                    type="number"
                    min="0"
                    placeholder="kg/ha"
                    value={formData.potassium}
                    onChange={(e) => handleInputChange("potassium", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Normal: 150-250</p>
                </div>
              </div>

              {/* Environmental Factors */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 28.5"
                    value={formData.temperature}
                    onChange={(e) => handleInputChange("temperature", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rainfall">Rainfall (mm)</Label>
                  <Input
                    id="rainfall"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 1200"
                    value={formData.rainfall}
                    onChange={(e) => handleInputChange("rainfall", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" size="lg" className="w-full" disabled={!isFormValid()}>
                <Sparkles className="w-5 h-5 mr-2" />
                Get Recommendations
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
