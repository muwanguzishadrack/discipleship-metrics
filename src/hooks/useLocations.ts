import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LocationService, LocationFilters } from '@/services/locationService'
import { LocationInsert, LocationUpdate } from '@/types/database'
import { toast } from 'sonner'

// Query Keys
export const LOCATION_QUERY_KEYS = {
  all: ['locations'] as const,
  lists: () => [...LOCATION_QUERY_KEYS.all, 'list'] as const,
  list: (filters: LocationFilters) => [...LOCATION_QUERY_KEYS.lists(), filters] as const,
  active: () => [...LOCATION_QUERY_KEYS.all, 'active'] as const,
  detail: (id: string) => [...LOCATION_QUERY_KEYS.all, 'detail', id] as const,
  usage: (id: string) => [...LOCATION_QUERY_KEYS.all, 'usage', id] as const,
  search: (query: string) => [...LOCATION_QUERY_KEYS.all, 'search', query] as const,
}

// Hook for fetching locations with filters
export function useLocations(filters: LocationFilters = {}) {
  return useQuery({
    queryKey: LOCATION_QUERY_KEYS.list(filters),
    queryFn: () => LocationService.getLocations(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook for fetching only active locations (for dropdowns)
export function useActiveLocations() {
  return useQuery({
    queryKey: LOCATION_QUERY_KEYS.active(),
    queryFn: () => LocationService.getActiveLocations(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Hook for location usage statistics
export function useLocationUsageStats(locationId: string) {
  return useQuery({
    queryKey: LOCATION_QUERY_KEYS.usage(locationId),
    queryFn: () => LocationService.getLocationUsageStats(locationId),
    enabled: !!locationId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Hook for searching locations
export function useLocationSearch(query: string) {
  return useQuery({
    queryKey: LOCATION_QUERY_KEYS.search(query),
    queryFn: () => LocationService.searchLocations(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook for creating locations
export function useCreateLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (location: LocationInsert) => LocationService.createLocation(location),
    onSuccess: (newLocation) => {
      // Invalidate and refetch location lists
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.all })
      
      // Optimistically add to active locations
      queryClient.setQueryData(LOCATION_QUERY_KEYS.active(), (old: any) => {
        if (!old) return [newLocation]
        return [...old, newLocation].sort((a, b) => a.name.localeCompare(b.name))
      })

      toast.success(`Location "${newLocation.name}" created successfully!`)
    },
    onError: (error: Error) => {
      console.error('Error creating location:', error)
      toast.error(error.message || 'Failed to create location')
    },
  })
}

// Hook for updating locations
export function useUpdateLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: LocationUpdate }) =>
      LocationService.updateLocation(id, updates),
    onSuccess: (updatedLocation) => {
      // Invalidate and refetch location lists
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.all })
      
      // Update specific location in cache
      queryClient.setQueryData(
        LOCATION_QUERY_KEYS.detail(updatedLocation.id),
        updatedLocation
      )

      toast.success(`Location "${updatedLocation.name}" updated successfully!`)
    },
    onError: (error: Error) => {
      console.error('Error updating location:', error)
      toast.error(error.message || 'Failed to update location')
    },
  })
}

// Hook for deleting locations
export function useDeleteLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => LocationService.deleteLocation(id),
    onSuccess: () => {
      // Invalidate and refetch all location queries
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.all })
      
      // Also invalidate attendance reports since location might affect them
      queryClient.invalidateQueries({ queryKey: ['attendance'] })

      toast.success('Location deleted successfully!')
    },
    onError: (error: Error) => {
      console.error('Error deleting location:', error)
      toast.error(error.message || 'Failed to delete location')
    },
  })
}