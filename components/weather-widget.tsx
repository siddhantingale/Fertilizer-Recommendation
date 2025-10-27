"use client"

import { useEffect, useState } from "react"
import { Cloud, CloudRain, Sun, Wind, Droplets } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface WeatherData {
  temperature: number
  humidity: number
  condition: string
  windSpeed: number
}

function getWeatherCondition(code: number): string {
  if (code === 0 || code === 1) return "Sunny"
  if (code === 2 || code === 3) return "Cloudy"
  if (code >= 45 && code <= 82) return "Rainy"
  return "Unknown"
}

export function WeatherWidget({ location }: { location?: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords
                const response = await fetch(
                  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`,
                )
                const data = await response.json()
                const current = data.current

                setWeather({
                  temperature: Math.round(current.temperature_2m || 0),
                  humidity: current.relative_humidity_2m || 0,
                  condition: getWeatherCondition(current.weather_code || 0),
                  windSpeed: Math.round(current.wind_speed_10m || 0),
                })
              } catch (error) {
                console.log("[v0] Weather data parse error:", error)
              } finally {
                setLoading(false)
              }
            },
            (error) => {
              console.log("[v0] Geolocation error:", error)
              setLoading(false)
            },
          )
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.log("[v0] Weather fetch error:", error)
        setLoading(false)
      }
    }

    fetchWeather()
  }, [location])

  const getWeatherIcon = () => {
    if (!weather) return <Sun className="w-8 h-8 text-yellow-500" />
    if (weather.condition === "Sunny") return <Sun className="w-8 h-8 text-yellow-500" />
    if (weather.condition === "Cloudy") return <Cloud className="w-8 h-8 text-gray-500" />
    if (weather.condition === "Rainy") return <CloudRain className="w-8 h-8 text-blue-500" />
    return <Sun className="w-8 h-8 text-yellow-500" />
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sun className="w-8 h-8 text-yellow-500 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Weather</p>
                <p className="text-2xl font-bold">Loading...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getWeatherIcon()}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Weather</p>
              <p className="text-2xl font-bold">{weather?.temperature}°C</p>
              <p className="text-sm text-muted-foreground">{weather?.condition}</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Humidity</p>
              <p className="font-semibold">{weather?.humidity}%</p>
            </div>
            <div className="text-center">
              <Wind className="w-5 h-5 text-gray-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Wind</p>
              <p className="font-semibold">{weather?.windSpeed} km/h</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
