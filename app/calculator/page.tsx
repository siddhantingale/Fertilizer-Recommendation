"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalculatorIcon } from "lucide-react"
import { getUser, getFarmsByUser, getSoilTestsByFarmId, type Farm, type SoilTest } from "@/lib/storage"
import Link from "next/link"

export default function CalculatorPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [farms, setFarms] = useState<Farm[]>([])
  const [selectedFarmId, setSelectedFarmId] = useState("")
  const [soilTests, setSoilTests] = useState<SoilTest[]>([])
  const [selectedTestId, setSelectedTestId] = useState("")

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }
    setUser(currentUser)

    const myFarms = getFarmsByUser(currentUser.id)
    setFarms(myFarms)
  }, [])

  useEffect(() => {
    if (selectedFarmId) {
      const tests = getSoilTestsByFarmId(selectedFarmId)
      setSoilTests(tests)
      setSelectedTestId("")
    }
  }, [selectedFarmId])

  const handleCalculate = () => {
    if (!selectedFarmId || !selectedTestId) {
      return
    }
    router.push(`/results?farmId=${selectedFarmId}&testId=${selectedTestId}`)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">NPK Calculator</h1>
          <p className="text-muted-foreground">
            Get personalized fertilizer recommendations based on your soil analysis
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center">
                  <CalculatorIcon className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>Select Farm & Soil Test</CardTitle>
              </div>
              <CardDescription>Choose your farm and latest soil analysis results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Farm</label>
                <Select value={selectedFarmId} onValueChange={setSelectedFarmId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a farm" />
                  </SelectTrigger>
                  <SelectContent>
                    {farms.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">No farms available</div>
                    ) : (
                      farms.map((farm) => (
                        <SelectItem key={farm.id} value={farm.id}>
                          {farm.name} - {farm.location}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Soil Test</label>
                <Select value={selectedTestId} onValueChange={setSelectedTestId} disabled={!selectedFarmId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose soil test" />
                  </SelectTrigger>
                  <SelectContent>
                    {soilTests.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        {selectedFarmId ? "No soil tests available" : "Select a farm first"}
                      </div>
                    ) : (
                      soilTests.map((test) => (
                        <SelectItem key={test.id} value={test.id}>
                          {new Date(test.testDate).toLocaleDateString()} - pH: {test.ph}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedFarmId && soilTests.length === 0 && (
                <div className="bg-muted p-4 rounded-lg text-sm">
                  <p className="text-muted-foreground mb-2">No soil tests found for this farm.</p>
                  <Link href={`/soil-test?farmId=${selectedFarmId}`}>
                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      Add Soil Test Data
                    </Button>
                  </Link>
                </div>
              )}

              <Button className="w-full" onClick={handleCalculate} disabled={!selectedFarmId || !selectedTestId}>
                <CalculatorIcon className="w-4 h-4 mr-2" />
                Calculate NPK
              </Button>
            </CardContent>
          </Card>

          {/* Right Side - Info */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="bg-muted/50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                <CalculatorIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ready to Calculate</h3>
              <p className="text-muted-foreground max-w-md">
                Select your farm and soil test to generate fertilizer recommendations
              </p>
            </CardContent>
          </Card>
        </div>

        {farms.length === 0 && (
          <Card className="mt-8 border-primary/20">
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">You need to register a farm before using the calculator</p>
              <Link href="/farms">
                <Button>Go to My Farms</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
