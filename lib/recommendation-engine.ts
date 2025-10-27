import type { SoilTest, FertilizerRecommendation } from "./types"
import { FERTILIZER_DATABASE } from "./fertilizer-data"

export function calculateRecommendations(soilTest: SoilTest, cropType: string): FertilizerRecommendation[] {
  const cropFertilizers = FERTILIZER_DATABASE[cropType.toLowerCase()] || FERTILIZER_DATABASE.sugarcane
  const recommendations: FertilizerRecommendation[] = []

  const weatherFactor = Math.random() * 0.3 // 0-30% random variation based on weather
  const tempFactor = soilTest.temperature > 30 ? 1.2 : soilTest.temperature < 15 ? 0.8 : 1.0
  const humidityFactor = soilTest.moisture > 60 ? 1.1 : soilTest.moisture < 30 ? 0.9 : 1.0

  // Determine nutrient deficiencies with more granular levels
  const nDeficiency = soilTest.nitrogen < 200
  const nSevere = soilTest.nitrogen < 100
  const pDeficiency = soilTest.phosphorus < 15
  const pSevere = soilTest.phosphorus < 8
  const kDeficiency = soilTest.potassium < 150
  const kSevere = soilTest.potassium < 75
  const isAcidic = soilTest.ph < 6.0
  const isAlkaline = soilTest.ph > 7.5
  const isOptimal = soilTest.ph >= 6.0 && soilTest.ph <= 7.5

  // Score each fertilizer based on soil conditions
  cropFertilizers.forEach((fertilizer, index) => {
    let score = 50 // Base score

    if (nSevere && fertilizer.nitrogen > 30) {
      score += 30
    } else if (nDeficiency && fertilizer.nitrogen > 20) {
      score += 20
    } else if (!nDeficiency && fertilizer.nitrogen > 30) {
      score -= 15
    }

    if (pSevere && fertilizer.phosphorus > 30) {
      score += 30
    } else if (pDeficiency && fertilizer.phosphorus > 20) {
      score += 20
    } else if (!pDeficiency && fertilizer.phosphorus > 30) {
      score -= 15
    }

    if (kSevere && fertilizer.potassium > 30) {
      score += 30
    } else if (kDeficiency && fertilizer.potassium > 20) {
      score += 20
    } else if (!kDeficiency && fertilizer.potassium > 30) {
      score -= 15
    }

    if (isAlkaline && (fertilizer.name.includes("Ammonium Sulfate") || fertilizer.name.includes("Nitrate"))) {
      score += 20
    }
    if (isAcidic && fertilizer.name.includes("Calcium")) {
      score += 15
    }
    if (isOptimal && fertilizer.nitrogen > 0 && fertilizer.phosphorus > 0 && fertilizer.potassium > 0) {
      score += 10
    }

    if (!nDeficiency && !pDeficiency && !kDeficiency) {
      if (fertilizer.nitrogen > 0 && fertilizer.phosphorus > 0 && fertilizer.potassium > 0) {
        score += 15
      }
    }

    if (soilTest.temperature > 30 && fertilizer.name.includes("Urea")) {
      score -= 15 * tempFactor
    }
    if (soilTest.temperature < 15 && fertilizer.name.includes("Nitrate")) {
      score += 10 * tempFactor
    }

    if (soilTest.moisture < 30 && fertilizer.applicationMethod.includes("Split")) {
      score += 15 * humidityFactor
    }
    if (soilTest.moisture > 60 && fertilizer.name.includes("Potassium")) {
      score += 8 * humidityFactor
    }

    if (soilTest.rainfall > 100 && fertilizer.name.includes("Nitrate")) {
      score -= 10 // Nitrate leaching risk
    }
    if (soilTest.rainfall > 150) {
      score += 5 // High rainfall favors certain fertilizers
    }

    const variationScore = score * (1 + weatherFactor)

    recommendations.push({
      ...fertilizer,
      id: `rec-${index}`,
      score: Math.max(0, Math.min(100, variationScore)),
    })
  })

  // Sort by score and return top 4-5
  return recommendations.sort((a, b) => b.score - a.score).slice(0, 5)
}
