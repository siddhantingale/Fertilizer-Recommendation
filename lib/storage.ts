"use client"

import type { User, Farm, SoilTest } from "./types"

// User management
export function saveUser(user: User) {
  localStorage.setItem("fertilizerpro_user", JSON.stringify(user))
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem("fertilizerpro_user")
  return user ? JSON.parse(user) : null
}

export function clearUser() {
  localStorage.removeItem("fertilizerpro_user")
}

// Profile management
const PROFILES_KEY = "fertilizerpro_profiles"

// helper to read all profiles as a map
function getProfilesMap(): Record<string, User> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    return raw ? (JSON.parse(raw) as Record<string, User>) : {}
  } catch {
    return {}
  }
}

export function saveProfile(profile: User) {
  // store user profile by phone to support multiple farmers
  const map = getProfilesMap()
  map[profile.phone] = profile
  localStorage.setItem(PROFILES_KEY, JSON.stringify(map))
}

export function getProfileByPhone(phone: string): User | null {
  const map = getProfilesMap()
  return map[phone] || null
}

// Farm management
export function saveFarm(farm: Farm) {
  const farms = getFarms()
  farms.push(farm)
  localStorage.setItem("fertilizerpro_farms", JSON.stringify(farms))
}

export function getFarms(): Farm[] {
  if (typeof window === "undefined") return []
  const farms = localStorage.getItem("fertilizerpro_farms")
  return farms ? JSON.parse(farms) : []
}

export function getFarmById(id: string): Farm | null {
  const farms = getFarms()
  return farms.find((f) => f.id === id) || null
}

export function updateFarm(id: string, updates: Partial<Farm>) {
  const farms = getFarms()
  const index = farms.findIndex((f) => f.id === id)
  if (index !== -1) {
    farms[index] = { ...farms[index], ...updates }
    localStorage.setItem("fertilizerpro_farms", JSON.stringify(farms))
  }
}

export function deleteFarm(id: string) {
  const farms = getFarms()
  const filtered = farms.filter((f) => f.id !== id)
  localStorage.setItem("fertilizerpro_farms", JSON.stringify(filtered))
}

// Soil test management
export function saveSoilTest(test: SoilTest) {
  const tests = getSoilTests()
  tests.push(test)
  localStorage.setItem("fertilizerpro_soil_tests", JSON.stringify(tests))
}

export function getSoilTests(): SoilTest[] {
  if (typeof window === "undefined") return []
  const tests = localStorage.getItem("fertilizerpro_soil_tests")
  return tests ? JSON.parse(tests) : []
}

export function getSoilTestsByFarmId(farmId: string): SoilTest[] {
  const tests = getSoilTests()
  return tests.filter((t) => t.farmId === farmId)
}

export function getLatestSoilTest(farmId: string): SoilTest | null {
  const tests = getSoilTestsByFarmId(farmId)
  if (tests.length === 0) return null
  return tests.sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime())[0]
}

// Per-user getters for farms and soil tests
export function getFarmsByUser(userId: string): Farm[] {
  const farms = getFarms()
  return farms.filter((f) => f.userId === userId)
}

export function getSoilTestsByUser(userId: string): SoilTest[] {
  const farms = getFarmsByUser(userId)
  const farmIds = new Set(farms.map((f) => f.id))
  const tests = getSoilTests()
  return tests.filter((t) => farmIds.has(t.farmId))
}
