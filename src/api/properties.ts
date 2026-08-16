import { apiClient } from "@/api/client"
import type { Property, PropertyDetail } from "@/types/property"

export type PropertyListResponse = {
  data: Property[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function fetchProperties(
  query = ""
): Promise<PropertyListResponse> {
  const queryString = query ? `?${query}` : ""

  return apiClient.get<PropertyListResponse>(
    `/api/properties${queryString}`
  )
}

export async function fetchPropertyDetail(
  id: string
): Promise<PropertyDetail> {
  return apiClient.get<PropertyDetail>(`/api/properties/${id}`)
}