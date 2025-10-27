"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Tractor, MapPin, Maximize2 } from "lucide-react"
import { getUser, getFarms, saveFarm, updateFarm, deleteFarm, type Farm } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { getLocationByCoordinates } from "@/lib/weather-service"

export default function FarmsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [farms, setFarms] = useState<Farm[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    area: "",
    soilType: "",
    cropType: "",
    soilPH: "",
    organicMatter: "",
  })

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }
    setUser(currentUser)
    loadFarms(currentUser.id)
  }, [router])

  const loadFarms = (uid?: string) => {
    const allFarms = getFarms()
    const filtered = uid ? allFarms.filter((f) => f.userId === uid) : allFarms
    setFarms(filtered)
  }

  const openAddDialog = () => {
    setEditingFarm(null)
    setFormData({
      name: "",
      location: "",
      area: "",
      soilType: "",
      cropType: "",
      soilPH: "",
      organicMatter: "",
    })

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            )
            const data = await response.json()
            const locationName = data.address?.city || data.address?.town || data.address?.village || "Unknown Location"
            setFormData((prev) => ({
              ...prev,
              location: locationName,
            }))
          } catch (error) {
            console.log("[v0] Location fetch error:", error)
          }
        },
        (error) => {
          console.log("[v0] Geolocation error:", error)
        },
      )
    }

    setShowDialog(true)
  }

  const openEditDialog = (farm: Farm) => {
    setEditingFarm(farm)
    setFormData({
      name: farm.name,
      location: farm.location,
      area: String(farm.area),
      soilType: farm.soilType,
      cropType: farm.cropType,
      soilPH: farm.soilPH != null ? String(farm.soilPH) : "",
      organicMatter: farm.organicMatter != null ? String(farm.organicMatter) : "",
    })
    setShowDialog(true)
  }

  const handleRemove = (farm: Farm) => {
    if (confirm(`Remove farm "${farm.name}"?`)) {
      deleteFarm(farm.id)
      loadFarms(user.id)
      toast({ title: "Farm removed", description: "The farm has been deleted." })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.location || !formData.area || !formData.soilType || !formData.cropType) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (editingFarm) {
      updateFarm(editingFarm.id, {
        name: formData.name,
        location: formData.location,
        area: Number.parseFloat(formData.area),
        soilType: formData.soilType,
        cropType: formData.cropType,
        soilPH: formData.soilPH ? Number.parseFloat(formData.soilPH) : undefined,
        organicMatter: formData.organicMatter ? Number.parseFloat(formData.organicMatter) : undefined,
      })
      loadFarms(user.id)
      setShowDialog(false)
      toast({ title: "Farm Updated", description: "Your farm details have been updated." })
      return
    }

    const newFarm: Farm = {
      id: `farm-${Date.now()}`,
      userId: user.id,
      name: formData.name,
      location: formData.location,
      area: Number.parseFloat(formData.area),
      soilType: formData.soilType,
      cropType: formData.cropType,
      soilPH: formData.soilPH ? Number.parseFloat(formData.soilPH) : undefined,
      organicMatter: formData.organicMatter ? Number.parseFloat(formData.organicMatter) : undefined,
      createdAt: new Date().toISOString(),
    }

    saveFarm(newFarm)
    loadFarms(user.id)
    setShowDialog(false)
    setFormData({
      name: "",
      location: "",
      area: "",
      soilType: "",
      cropType: "",
      soilPH: "",
      organicMatter: "",
    })

    toast({
      title: "Farm Added",
      description: "Your farm has been successfully registered",
    })
  }

  const handleAutoDetectLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const locationName = await getLocationByCoordinates(latitude, longitude)
        setFormData((prev) => ({
          ...prev,
          location: locationName || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        }))
        toast({
          title: "Location detected",
          description: `Location set to ${locationName}`,
        })
      },
      () => {
        toast({
          title: "Location access denied",
          description: "Please enable location access to auto-detect",
          variant: "destructive",
        })
      },
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Farms</h1>
            <p className="text-muted-foreground">Manage your registered farms and track their progress</p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Farm
          </Button>
        </div>

        {farms.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tractor className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Farms Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first farm to get personalized recommendations
              </p>
              <Button onClick={openAddDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Farm
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map((farm) => (
              <Card key={farm.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tractor className="w-5 h-5 text-primary" />
                    {farm.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {farm.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Area:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Maximize2 className="w-3 h-3" />
                      {farm.area} acres
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Crop Type:</span>
                    <span className="font-medium">{farm.cropType}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Soil Type:</span>
                    <span className="font-medium">{farm.soilType}</span>
                  </div>
                  {farm.soilPH && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Soil pH:</span>
                      <span className="font-medium">{farm.soilPH}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button size="sm" variant="outline" className="bg-transparent" onClick={() => openEditDialog(farm)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleRemove(farm)}>
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingFarm ? "Edit Farm" : "Register New Farm"}</DialogTitle>
              <DialogDescription>
                {editingFarm
                  ? "Update your farm details"
                  : "Add your farm details to get personalized fertilizer recommendations"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Farm Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter farm name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    Location <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="City, State/Province"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">
                    Area (acres) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="area"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="soilType">
                    Soil Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.soilType}
                    onValueChange={(value) => setFormData({ ...formData, soilType: value })}
                  >
                    <SelectTrigger id="soilType">
                      <SelectValue placeholder="Select soil type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Clay">Clay</SelectItem>
                      <SelectItem value="Sandy">Sandy</SelectItem>
                      <SelectItem value="Loamy">Loamy</SelectItem>
                      <SelectItem value="Silty">Silty</SelectItem>
                      <SelectItem value="Peaty">Peaty</SelectItem>
                      <SelectItem value="Chalky">Chalky</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cropType">
                    Crop Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.cropType}
                    onValueChange={(value) => setFormData({ ...formData, cropType: value })}
                  >
                    <SelectTrigger id="cropType">
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                      <SelectItem value="Rice">Rice</SelectItem>
                      <SelectItem value="Wheat">Wheat</SelectItem>
                      <SelectItem value="Cotton">Cotton</SelectItem>
                      <SelectItem value="Corn">Corn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="soilPH">Soil pH (Optional)</Label>
                  <Input
                    id="soilPH"
                    type="number"
                    step="0.1"
                    placeholder="7.0"
                    value={formData.soilPH}
                    onChange={(e) => setFormData({ ...formData, soilPH: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organicMatter">Organic Matter % (Optional)</Label>
                  <Input
                    id="organicMatter"
                    type="number"
                    step="0.1"
                    placeholder="3.5"
                    value={formData.organicMatter}
                    onChange={(e) => setFormData({ ...formData, organicMatter: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAutoDetectLocation}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  📍 Use My Location
                </Button>
                <Button type="submit">{editingFarm ? "Save Changes" : "Add Farm"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
