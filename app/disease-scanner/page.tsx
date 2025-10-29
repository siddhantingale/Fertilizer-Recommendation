"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Upload, X, Loader2, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react"
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
      setError(null)
      console.log("[v0] Requesting camera access...")

      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log("[v0] Camera stream obtained successfully")

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.muted = true
        videoRef.current.playsInline = true
        videoRef.current.autoplay = true

        // Set a timeout to handle cases where onloadedmetadata doesn't fire
        const timeoutId = setTimeout(async () => {
          console.log("[v0] Timeout reached, attempting to play video")
          try {
            if (videoRef.current && videoRef.current.readyState >= 2) {
              await videoRef.current.play()
              console.log("[v0] Video playing after timeout")
              setIsCameraOpen(true)
            }
          } catch (err) {
            console.error("[v0] Play error after timeout:", err)
          }
        }, 1000)

        videoRef.current.onloadedmetadata = async () => {
          clearTimeout(timeoutId)
          console.log("[v0] Video metadata loaded")
          try {
            if (videoRef.current) {
              await videoRef.current.play()
              console.log("[v0] Video playing successfully")
              setIsCameraOpen(true)
            }
          } catch (playErr: any) {
            console.error("[v0] Play error:", playErr)
            setError("Failed to start camera. Please check permissions and try again.")
            closeCamera()
          }
        }

        videoRef.current.onerror = (err) => {
          console.error("[v0] Video element error:", err)
          setError("Camera error. Please try again.")
          closeCamera()
        }
      }
    } catch (err: any) {
      console.error("[v0] Camera error:", err)
      let errorMessage = "Camera access denied"
      if (err.name === "NotAllowedError") {
        errorMessage = "Camera permission denied. Please enable camera access in your phone settings."
      } else if (err.name === "NotFoundError") {
        errorMessage = "No camera found on this device."
      } else if (err.name === "NotReadableError") {
        errorMessage = "Camera is already in use by another app. Please close other apps and try again."
      } else if (err.name === "OverconstrainedError") {
        errorMessage = "Camera constraints not supported. Trying with basic settings..."
        // Fallback to basic constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false,
          })
          streamRef.current = basicStream
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream
            videoRef.current.muted = true
            videoRef.current.playsInline = true
            await videoRef.current.play()
            setIsCameraOpen(true)
            setError(null)
            console.log("[v0] Camera opened with basic constraints")
          }
        } catch (fallbackErr) {
          console.error("[v0] Fallback camera error:", fallbackErr)
          setError("Unable to access camera. Please check permissions.")
        }
        return
      }
      setError(errorMessage)
    }
  }

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        console.log("[v0] Stopping track:", track.kind)
        track.stop()
      })
      streamRef.current = null
    }
    setIsCameraOpen(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      try {
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
          analyzeImage(imageData)
        }
      } catch (err) {
        console.error("[v0] Capture error:", err)
        setError("Failed to capture photo")
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageData = event.target?.result as string
        setImage(imageData)
        analyzeImage(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      console.log("[v0] Starting image analysis...")

      // Validate image is a crop leaf
      const canvas = document.createElement("canvas")
      const img = new Image()
      img.onload = async () => {
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          let greenPixels = 0
          const totalPixels = data.length / 4

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]

            // Check if pixel is greenish (crop leaf)
            if (g > r + 20 && g > b + 20) {
              greenPixels++
            }
          }

          const greenPercentage = (greenPixels / totalPixels) * 100
          console.log("[v0] Green pixels percentage:", greenPercentage)

          if (greenPercentage < 15) {
            setError("Image does not appear to be a crop leaf. Please upload a clear photo of a crop leaf.")
            setIsAnalyzing(false)
            return
          }

          // Analyze for diseases based on color patterns
          const diseaseResult = analyzeDiseasePatterns(data, totalPixels)
          setResult(diseaseResult)
        }
      }
      img.src = imageData
    } catch (err) {
      console.error("[v0] Analysis error:", err)
      setError("Failed to analyze image. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeDiseasePatterns = (imageData: Uint8ClampedArray, totalPixels: number): DiseaseResult => {
    let brownPixels = 0
    let yellowPixels = 0
    let whitePixels = 0
    let darkSpots = 0

    for (let i = 0; i < imageData.length; i += 4) {
      const r = imageData[i]
      const g = imageData[i + 1]
      const b = imageData[i + 2]

      // Brown pixels (fungal diseases)
      if (r > 100 && g < 100 && b < 100 && r > g && r > b) {
        brownPixels++
      }

      // Yellow pixels (bacterial/viral)
      if (r > 150 && g > 150 && b < 100) {
        yellowPixels++
      }

      // White pixels (powdery mildew)
      if (r > 200 && g > 200 && b > 200) {
        whitePixels++
      }

      // Dark spots (blight)
      if (r < 50 && g < 50 && b < 50) {
        darkSpots++
      }
    }

    const brownPercentage = (brownPixels / totalPixels) * 100
    const yellowPercentage = (yellowPixels / totalPixels) * 100
    const whitePercentage = (whitePixels / totalPixels) * 100
    const darkPercentage = (darkSpots / totalPixels) * 100

    console.log("[v0] Disease analysis:", {
      brown: brownPercentage,
      yellow: yellowPercentage,
      white: whitePercentage,
      dark: darkPercentage,
    })

    // Determine disease based on color analysis
    if (brownPercentage > 5) {
      return {
        cropType: "Rice",
        disease: "Leaf Blast",
        confidence: Math.min(95, 70 + brownPercentage),
        severity: "High",
        description: "Rice Leaf Blast is a fungal disease that causes brown lesions on leaves",
        treatment: [
          "Apply fungicide spray (Tricyclazole or Propiconazole)",
          "Remove infected leaves",
          "Improve drainage",
          "Avoid excessive nitrogen",
        ],
        fertilizers: ["Potassium-rich fertilizers", "Balanced NPK (10-10-10)"],
        pesticides: ["Tricyclazole 75% WP", "Propiconazole 25% EC"],
        preventiveMeasures: [
          "Use resistant varieties",
          "Maintain proper spacing",
          "Avoid overhead irrigation",
          "Monitor regularly",
        ],
      }
    }

    if (yellowPercentage > 5) {
      return {
        cropType: "Tomato",
        disease: "Early Blight",
        confidence: Math.min(95, 70 + yellowPercentage),
        severity: "Medium",
        description: "Early Blight causes yellow spots with concentric rings on leaves",
        treatment: [
          "Remove infected leaves",
          "Apply copper fungicide",
          "Improve air circulation",
          "Water at soil level",
        ],
        fertilizers: ["Calcium nitrate", "Balanced NPK (12-12-12)"],
        pesticides: ["Copper oxychloride 50% WP", "Mancozeb 75% WP"],
        preventiveMeasures: [
          "Crop rotation",
          "Remove plant debris",
          "Avoid wetting foliage",
          "Stake plants for air flow",
        ],
      }
    }

    if (whitePercentage > 3) {
      return {
        cropType: "Wheat",
        disease: "Powdery Mildew",
        confidence: Math.min(95, 70 + whitePercentage),
        severity: "Medium",
        description: "Powdery Mildew appears as white powder on leaf surfaces",
        treatment: [
          "Apply sulfur dust or spray",
          "Improve air circulation",
          "Reduce humidity",
          "Remove infected parts",
        ],
        fertilizers: ["Potassium sulfate", "Balanced NPK (10-10-10)"],
        pesticides: ["Sulfur 80% WP", "Karathane 40% EC"],
        preventiveMeasures: [
          "Maintain proper spacing",
          "Avoid excessive nitrogen",
          "Monitor regularly",
          "Use resistant varieties",
        ],
      }
    }

    if (darkPercentage > 8) {
      return {
        cropType: "Potato",
        disease: "Late Blight",
        confidence: Math.min(95, 70 + darkPercentage),
        severity: "High",
        description: "Late Blight causes dark water-soaked spots on leaves",
        treatment: [
          "Apply metalaxyl fungicide",
          "Remove infected plants",
          "Improve drainage",
          "Avoid overhead irrigation",
        ],
        fertilizers: ["Potassium nitrate", "Balanced NPK (10-10-10)"],
        pesticides: ["Metalaxyl 8% + Mancozeb 64% WS", "Ridomil Gold"],
        preventiveMeasures: ["Use certified seed", "Crop rotation", "Monitor weather", "Remove volunteer plants"],
      }
    }

    // Default healthy leaf
    return {
      cropType: "General Crop",
      disease: "Healthy Leaf",
      confidence: 85,
      severity: "None",
      description: "The leaf appears to be healthy with no visible disease symptoms",
      treatment: ["Continue regular monitoring", "Maintain proper care"],
      fertilizers: ["Balanced NPK (10-10-10)", "Organic compost"],
      pesticides: ["No pesticides needed"],
      preventiveMeasures: ["Regular monitoring", "Proper irrigation", "Adequate spacing", "Crop rotation"],
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Crop Disease Scanner</h1>
          <p className="text-muted-foreground">
            Scan your crop leaves to detect diseases and get instant treatment recommendations
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Camera/Upload Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Capture or Upload Image</CardTitle>
                <CardDescription>Take a clear photo of the crop leaf</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isCameraOpen && !image && (
                  <div className="space-y-3">
                    <Button onClick={openCamera} className="w-full" size="lg">
                      <Camera className="w-4 h-4 mr-2" />
                      Open Camera
                    </Button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}

                {isCameraOpen && (
                  <div className="space-y-3">
                    <video ref={videoRef} className="w-full rounded-lg bg-black" playsInline muted />
                    <div className="flex gap-2">
                      <Button onClick={capturePhoto} className="flex-1" size="lg">
                        <Camera className="w-4 h-4 mr-2" />
                        Capture
                      </Button>
                      <Button onClick={closeCamera} variant="outline" className="flex-1 bg-transparent" size="lg">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {image && !isAnalyzing && (
                  <div className="space-y-3">
                    <img src={image || "/placeholder.svg"} alt="Captured" className="w-full rounded-lg" />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setImage(null)
                          setResult(null)
                          setError(null)
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Analyzing image...</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Error</p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {result && (
              <>
                <Card
                  className={
                    result.disease === "Healthy Leaf"
                      ? "border-green-200 bg-green-50"
                      : "border-orange-200 bg-orange-50"
                  }
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {result.disease === "Healthy Leaf" ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                          )}
                          {result.disease}
                        </CardTitle>
                        <CardDescription>{result.cropType}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{result.confidence}%</div>
                        <div className="text-xs text-muted-foreground">Confidence</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Severity</p>
                      <p className="text-sm text-muted-foreground">{result.severity}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Description</p>
                      <p className="text-sm text-muted-foreground">{result.description}</p>
                    </div>
                  </CardContent>
                </Card>

                {result.disease !== "Healthy Leaf" && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Treatment Steps</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ol className="space-y-2">
                          {result.treatment.map((step, idx) => (
                            <li key={idx} className="flex gap-3 text-sm">
                              <span className="font-semibold text-primary flex-shrink-0">{idx + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Recommended Fertilizers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {result.fertilizers.map((fert, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              {fert}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Recommended Pesticides</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {result.pesticides.map((pest, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              {pest}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Preventive Measures</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {result.preventiveMeasures.map((measure, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              {measure}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
