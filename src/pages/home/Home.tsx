import { HeroSection } from "./components/HeroSection"
import { PropertyList } from "./components/PropertyList"
import { SearchFilters } from "./components/SearchFilters"
import type { Property } from "@/types/property"
import { useProperties } from "@/hooks/useProperties"
import { useUIStore } from "@/stores/uiStore"

export function Home() {
  const searchQuery = useUIStore((state) => state.searchQuery)
  const activeCategory = useUIStore((state) => state.activeCategory)

  const {
    data,
    isLoading,
    isError,
  } = useProperties()

  // PropertyListResponse -> actual property array
  const properties: Property[] = data?.data ?? []

  const filterBySearch = (property: Property) => {
    const query = searchQuery.trim().toLowerCase()

    if (query === "") {
      return true
    }

    return (
      property.title.toLowerCase().includes(query) ||
      property.location.toLowerCase().includes(query)
    )
  }

  const filterByCategory = (property: Property) => {
    return (
      activeCategory === "All" ||
      property.type === activeCategory
    )
  }

  const filteredProperties = properties.filter(
    (property) =>
      filterBySearch(property) &&
      filterByCategory(property),
  )

  return (
    <>
      <HeroSection />

      <SearchFilters />

      {isLoading && (
        <div className="px-8 py-10 text-gray-500">
          Loading properties...
        </div>
      )}

      {isError && (
        <div className="px-8 py-10 text-red-400">
          Failed to load properties. Please try again.
        </div>
      )}

      {!isLoading && !isError && (
        <PropertyList properties={filteredProperties} />
      )}
    </>
  )
}