export interface User {
  id: string
  phone: string
  name: string
}

export interface Farm {
  id: string
  userId: string
  name: string
  location: string
  area: number
  soilType: string
  cropType: string
  soilPH?: number
  organicMatter?: number
  createdAt: string
}

export interface SoilTest {
  id: string
  farmId: string
  testDate: string
  nitrogen: number
  phosphorus: number
  potassium: number
  ph: number
  organicMatter: number
  moisture: number
  temperature: number
  rainfall: number
}

export interface FertilizerRecommendation {
  id: string
  name: string
  npkRatio: string
  nitrogen: number
  phosphorus: number
  potassium: number
  dosage: string
  applicationMethod: string
  benefits: string[]
  score: number
}
