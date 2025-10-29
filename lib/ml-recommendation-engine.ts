import type { SoilTest, FertilizerRecommendation } from "./types"
import { FERTILIZER_DATABASE } from "./fertilizer-data"
import type { WeatherData } from "./weather-service"

const CROP_NUTRIENT_REQUIREMENTS: Record<string, { N: number; P: number; K: number }> = {
  sugarcane: { N: 150, P: 60, K: 120 },
  rice: { N: 120, P: 60, K: 40 },
  wheat: { N: 120, P: 60, K: 40 },
  corn: { N: 150, P: 60, K: 40 },
  cotton: { N: 100, P: 50, K: 50 },
  vegetables: { N: 100, P: 50, K: 100 },
  potato: { N: 120, P: 60, K: 150 },
  tomato: { N: 150, P: 80, K: 120 },
  watermelon: { N: 100, P: 50, K: 150 },
  maize: { N: 150, P: 60, K: 40 },
}

const SOIL_TYPE_PH_RANGE: Record<string, { min: number; max: number }> = {
  "Acidic Soil": { min: 4.5, max: 6.0 },
  "Neutral Soil": { min: 6.0, max: 7.5 },
  "Alkaline Soil": { min: 7.5, max: 8.5 },
  "Sandy Soil": { min: 6.0, max: 7.0 },
  "Clay Soil": { min: 6.5, max: 7.5 },
  "Loamy Soil": { min: 6.0, max: 7.5 },
  Black: { min: 6.5, max: 7.5 },
  Red: { min: 5.5, max: 7.0 },
}

export function calculateMLRecommendations(
  soilTest: SoilTest,
  cropType: string,
  weatherData?: WeatherData,
): FertilizerRecommendation[] {
  const cropFertilizers = FERTILIZER_DATABASE[cropType.toLowerCase()] || FERTILIZER_DATABASE.sugarcane
  const cropRequirements = CROP_NUTRIENT_REQUIREMENTS[cropType.toLowerCase()] || CROP_NUTRIENT_REQUIREMENTS.sugarcane
  const recommendations: FertilizerRecommendation[] = []

  // Calculate nutrient deficiency percentages
  const nDeficiency = Math.max(0, (cropRequirements.N - soilTest.nitrogen) / cropRequirements.N)
  const pDeficiency = Math.max(0, (cropRequirements.P - soilTest.phosphorus) / cropRequirements.P)
  const kDeficiency = Math.max(0, (cropRequirements.K - soilTest.potassium) / cropRequirements.K)

  // Weather factors
  const tempFactor = weatherData ? (weatherData.temperature > 30 ? 1.3 : weatherData.temperature < 15 ? 0.7 : 1.0) : 1.0
  const humidityFactor = weatherData ? (weatherData.humidity > 70 ? 1.2 : weatherData.humidity < 40 ? 0.8 : 1.0) : 1.0
  const rainfallFactor = weatherData ? (weatherData.rainfall > 100 ? 0.9 : weatherData.rainfall < 20 ? 1.2 : 1.0) : 1.0

  // pH optimization factor
  const phDifference = Math.abs(soilTest.ph - 6.5)
  const phFactor = 1 - phDifference * 0.1

  // Score each fertilizer using ML-like algorithm
  cropFertilizers.forEach((fertilizer, index) => {
    let score = 50

    // Nutrient matching (40% weight)
    const nMatch = fertilizer.nitrogen > 0 ? Math.min(100, (fertilizer.nitrogen / 50) * 100) * nDeficiency : 0
    const pMatch = fertilizer.phosphorus > 0 ? Math.min(100, (fertilizer.phosphorus / 50) * 100) * pDeficiency : 0
    const kMatch = fertilizer.potassium > 0 ? Math.min(100, (fertilizer.potassium / 50) * 100) * kDeficiency : 0

    score += ((nMatch + pMatch + kMatch) / 3) * 0.4

    // pH compatibility (20% weight)
    const phCompatibility = calculatePHCompatibility(soilTest.ph, fertilizer.name)
    score += phCompatibility * 0.2

    // Weather compatibility (20% weight)
    if (weatherData) {
      const weatherCompatibility = calculateWeatherCompatibility(fertilizer.name, weatherData)
      score += weatherCompatibility * 0.2
    }

    // Soil type compatibility (10% weight)
    const soilCompatibility = calculateSoilCompatibility(soilTest.soilType || "Loamy Soil", fertilizer.name)
    score += soilCompatibility * 0.1

    // Apply environmental factors
    score *= tempFactor * humidityFactor * rainfallFactor * phFactor

    // Ensure score is between 0-100
    const finalScore = Math.max(0, Math.min(100, score))

    recommendations.push({
      ...fertilizer,
      id: `rec-${index}`,
      score: Math.round(finalScore),
    })
  })

  // Sort by score and return top 5
  return recommendations.sort((a, b) => b.score - a.score).slice(0, 5)
}

function calculatePHCompatibility(ph: number, fertilizerName: string): number {
  if (ph < 6.0) {
    if (fertilizerName.includes("Calcium") || fertilizerName.includes("Lime")) return 90
    if (fertilizerName.includes("Ammonium")) return 70
    return 50
  } else if (ph > 7.5) {
    if (fertilizerName.includes("Sulfate") || fertilizerName.includes("Nitrate")) return 90
    if (fertilizerName.includes("Phosphate")) return 70
    return 50
  }
  return 80
}

function calculateWeatherCompatibility(fertilizerName: string, weatherData: WeatherData): number {
  let score = 70

  if (weatherData.temperature > 30) {
    if (fertilizerName.includes("Potassium")) score += 15
  } else if (weatherData.temperature < 15) {
    if (fertilizerName.includes("Nitrogen")) score += 15
  }

  if (weatherData.humidity > 70) {
    if (fertilizerName.includes("Phosphate")) score += 10
  }

  if (weatherData.rainfall > 100) {
    if (fertilizerName.includes("Potassium")) score -= 10
  }

  return Math.min(100, score)
}

function calculateSoilCompatibility(soilType: string, fertilizerName: string): number {
  const soilLower = (soilType || "Loamy Soil").toLowerCase()

  if (soilLower.includes("sandy")) {
    if (fertilizerName.includes("Organic") || fertilizerName.includes("Compost")) return 90
    return 60
  }

  if (soilLower.includes("clay")) {
    if (fertilizerName.includes("Sulfate")) return 85
    return 70
  }

  if (soilLower.includes("acidic")) {
    if (fertilizerName.includes("Lime") || fertilizerName.includes("Calcium")) return 90
    return 60
  }

  if (soilLower.includes("alkaline")) {
    if (fertilizerName.includes("Sulfate") || fertilizerName.includes("Nitrate")) return 90
    return 60
  }

  return 75
}
