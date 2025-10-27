export interface WeatherData {
  temperature: number
  humidity: number
  rainfall: number
  windSpeed: number
  weatherCode: number
}

export async function getWeatherByCoordinates(latitude: number, longitude: number): Promise<WeatherData | undefined> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&timezone=auto`,
    )
    if (response.ok) {
      const data = await response.json()
      const current = data.current
      return {
        temperature: current.temperature_2m || 25,
        humidity: current.relative_humidity_2m || 60,
        rainfall: current.precipitation || 0,
        windSpeed: current.wind_speed_10m || 0,
        weatherCode: current.weather_code || 0,
      }
    }
  } catch (error) {
    console.log("[v0] Weather fetch error:", error)
  }

  return undefined
}

export async function getLocationByCoordinates(latitude: number, longitude: number): Promise<string | undefined> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
    )
    if (response.ok) {
      const data = await response.json()
      return data.address?.city || data.address?.town || data.address?.village || undefined
    }
  } catch (error) {
    console.log("[v0] Location fetch error:", error)
  }

  return undefined
}

export function getWeatherIcon(code: number) {
  if (code === 0 || code === 1) return "☀️" // Sunny
  if (code === 2 || code === 3) return "⛅" // Cloudy
  if (code >= 45 && code <= 48) return "🌫️" // Foggy
  if (code >= 51 && code <= 67) return "🌧️" // Drizzle/Rain
  if (code >= 71 && code <= 77) return "❄️" // Snow
  if (code >= 80 && code <= 82) return "⛈️" // Thunderstorm
  return "🌤️" // Default
}
