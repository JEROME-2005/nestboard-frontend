import type { Property, PropertyDetail } from "@/types/property"

const API_URL = import.meta.env.VITE_API_URL

export async function fetchProperties(): Promise<Property[]> {
  const res = await fetch(`${API_URL}/api/properties`)
  if (!res.ok) throw new Error("Failed to fetch properties")
  return res.json()
}

export async function fetchPropertyDetail(
  id: string
): Promise<PropertyDetail> {
  const res = await fetch(`${API_URL}/api/properties/${id}`)
  if (!res.ok) throw new Error(`Failed to fetch property: ${id}`)
  return res.json()
}