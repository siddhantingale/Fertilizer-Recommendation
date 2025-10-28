"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Upload, X, Loader2, CheckCircle, AlertTriangle, Leaf, ArrowLeft } from "lucide-react"
import { getUser } from "@/lib/storage"
import { useLanguage } from "@/lib/language-context"

interface DiseaseResult {
  cropType: string
  disease: string
  confidence: number
  severity: string
  description: string
  treatment: string[]
  fertilizers: string[]
  pesticides: string[]
  preventiveMeasures: string[]
}

export default function DiseaseScannerPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [image, setImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<DiseaseResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }
    setUser(currentUser)
  }, [router])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraOpen(true)
        setError(null)
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions.")
      console.error("Camera error:", err)
    }
  }

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsCameraOpen(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg", 0.9)
        setImage(imageData)
        closeCamera()
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!image) return

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      // Simulate API call with realistic disease detection
      await new Promise((resolve) => setTimeout(resolve, 2500))

      // Mock disease detection result
      const mockResults: DiseaseResult[] = [
        {
          cropType: "Rice",
          disease: "Rice Leaf Blast",
          confidence: 94.5,
          severity: "Moderate",
          description:
            "Rice blast is caused by the fungus Magnaporthe oryzae. It affects leaves, stems, and grains, causing diamond-shaped lesions with gray centers.",
          treatment: [
            "Remove and destroy infected plant parts",
            "Apply fungicide (Tricyclazole 75% WP) at 0.6g/L",
            "Ensure proper field drainage",
            "Avoid excessive nitrogen fertilization",
          ],
          fertilizers: ["Balanced NPK (10:26:26)", "Potassium-rich fertilizer"],
          pesticides: ["Tricyclazole 75% WP", "Carbendazim 50% WP", "Azoxystrobin 23% SC"],
          preventiveMeasures: [
            "Use resistant varieties",
            "Maintain proper plant spacing",
            "Avoid overhead irrigation",
            "Apply silicon-based fertilizers",
          ],
        },
        {
          cropType: "Tomato",
          disease: "Early Blight",
          confidence: 91.2,
          severity: "High",
          description:
            "Early blight is caused by Alternaria solani. It creates dark brown spots with concentric rings on older leaves.",
          treatment: [
            "Remove infected leaves immediately",
            "Apply copper-based fungicide",
            "Improve air circulation around plants",
            "Water at the base, not overhead",
          ],
          fertilizers: ["Calcium nitrate", "Balanced NPK (19:19:19)"],
          pesticides: ["Mancozeb 75% WP", "Chlorothalonil 75% WP", "Copper oxychloride 50% WP"],
          preventiveMeasures: [
            "Rotate crops annually",
            "Mulch around plants",
            "Stake plants for better airflow",
            "Remove plant debris",
          ],
        },
        {
          cropType: "Wheat",
          disease: "Leaf Rust",
          confidence: 88.7,
          severity: "Moderate",
          description:
            "Wheat leaf rust is caused by Puccinia triticina. Orange-brown pustules appear on leaves, reducing photosynthesis.",
          treatment: [
            "Apply fungicide at first sign of infection",
            "Use resistant wheat varieties",
            "Monitor fields regularly",
            "Apply at tillering and flag leaf stages",
          ],
          fertilizers: ["Urea (46% N)", "DAP (18:46:0)"],
          pesticides: ["Propiconazole 25% EC", "Tebuconazole 25% EC", "Mancozeb 75% WP"],
          preventiveMeasures: [
            "Plant resistant varieties",
            "Adjust planting dates",
            "Remove volunteer wheat",
            "Maintain balanced nutrition",
          ],
        },
      ]

      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)]
      setResult(randomResult)

      // Save to offline storage
      const scans = JSON.parse(localStorage.getItem("disease_scans") || "[]")
      scans.push({
        id: Date.now(),
        userId: user?.id,
        image,
        result: randomResult,
        timestamp: new Date().toISOString(),
        synced: false,
      })
      localStorage.setItem("disease_scans", JSON.stringify(scans))
    } catch (err) {
      setError("Failed to analyze image. Please try again.")
      console.error("Analysis error:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetScanner = () => {
    setImage(null)
    setResult(null)
    setError(null)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary" />
            Crop Disease Scanner
          </h1>
          <p className="text-muted-foreground">
            Scan crop leaves to detect diseases and get instant treatment recommendations
          </p>
        </div>

        {!image && !isCameraOpen && (
          <Card>
            <CardHeader>
              <CardTitle>Capture or Upload Leaf Image</CardTitle>
              <CardDescription>Take a clear photo of the affected leaf or upload an existing image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Button onClick={openCamera} className="h-32 flex flex-col gap-2 bg-transparent" variant="outline">
                  <Camera className="w-8 h-8" />
                  <span>Open Camera</span>
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-32 flex flex-col gap-2"
                  variant="outline"
                >
                  <Upload className="w-8 h-8" />
                  <span>Upload Image</span>
                </Button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isCameraOpen && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Camera</CardTitle>
                <Button variant="ghost" size="icon" onClick={closeCamera}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
              </div>
              <Button onClick={capturePhoto} className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Capture Photo
              </Button>
            </CardContent>
          </Card>
        )}

        {image && !result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Review Image</CardTitle>
                <Button variant="ghost" size="icon" onClick={resetScanner}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative rounded-lg overflow-hidden">
                <img src={image || "/placeholder.svg"} alt="Captured leaf" className="w-full h-auto" />
              </div>
              <Button onClick={analyzeImage} disabled={isAnalyzing} className="w-full">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Leaf className="w-4 h-4 mr-2" />
                    Analyze Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {result && (
          <div className="space-y-6">
            <Card className="border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    Analysis Complete
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={resetScanner}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <img src={image! || "/placeholder.svg"} alt="Analyzed leaf" className="w-full rounded-lg" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Crop Type</h3>
                      <p className="text-2xl font-bold text-primary">{result.cropType}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Disease Detected</h3>
                      <p className="text-xl font-bold">{result.disease}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Confidence</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-secondary rounded-full h-3">
                          <div
                            className="bg-primary h-3 rounded-full transition-all"
                            style={{ width: `${result.confidence}%` }}
                          />
                        </div>
                        <span className="text-lg font-bold">{result.confidence}%</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Severity</h3>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          result.severity === "High"
                            ? "bg-red-100 text-red-700"
                            : result.severity === "Moderate"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {result.severity}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{result.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Treatment Steps</h3>
                  <ul className="space-y-2">
                    {result.treatment.map((step, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Recommended Fertilizers</h3>
                    <ul className="space-y-1">
                      {result.fertilizers.map((fertilizer, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {fertilizer}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Recommended Pesticides</h3>
                    <ul className="space-y-1">
                      {result.pesticides.map((pesticide, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {pesticide}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Preventive Measures</h3>
                  <ul className="space-y-1">
                    {result.preventiveMeasures.map((measure, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        {measure}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button onClick={resetScanner} variant="outline" className="w-full bg-transparent">
                  Scan Another Leaf
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
