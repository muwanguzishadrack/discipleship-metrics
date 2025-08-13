import { supabase } from '@/lib/supabase'
import { Location, LocationInsert, LocationUpdate } from '@/types/database'

export interface LocationFilters {
  search?: string
  isActive?: boolean
}

export interface LocationWithUsage extends Location {
  usage_count?: number
  last_used?: string
}

export class LocationService {
  static async getLocations(filters: LocationFilters = {}): Promise<LocationWithUsage[]> {
    let query = supabase
      .from('locations')
      .select('*')
      .order('name', { ascending: true })

    // Apply active filter
    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive)
    }

    // Apply search filter
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw error

    // Get usage counts separately for each location
    const locationsWithUsage: LocationWithUsage[] = []
    
    for (const location of data || []) {
      const { data: usageData } = await supabase
        .from('attendance_reports')
        .select('id')
        .eq('location_id', location.id)

      locationsWithUsage.push({
        ...location,
        usage_count: usageData?.length || 0,
      })
    }

    return locationsWithUsage
  }

  static async getActiveLocations(): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async createLocation(location: LocationInsert): Promise<Location> {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession()
    
    // Prepare the location data with created_by if user is authenticated
    const locationData = {
      ...location,
      created_by: session?.user?.id || null
    }

    const { data, error } = await supabase
      .from('locations')
      .insert(locationData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateLocation(id: string, updates: LocationUpdate): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteLocation(id: string): Promise<void> {
    // Hard delete the location
    // The ON DELETE SET NULL constraint will automatically set location_id to NULL in attendance_reports
    console.log(`Deleting location ${id}`)
    
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting location:', error)
      throw error
    }
    
    console.log(`Successfully deleted location ${id}`)
  }

  static async getLocationUsageStats(id: string) {
    const { data, error } = await supabase
      .from('attendance_reports')
      .select('date, total_attendance')
      .eq('location_id', id)
      .order('date', { ascending: false })

    if (error) throw error

    const reports = data || []
    const totalReports = reports.length
    const totalAttendance = reports.reduce((sum, report) => sum + (report.total_attendance || 0), 0)
    const averageAttendance = totalReports > 0 ? Math.round(totalAttendance / totalReports) : 0
    const lastUsed = reports.length > 0 ? reports[0].date : null

    return {
      totalReports,
      totalAttendance,
      averageAttendance,
      lastUsed,
      reports: reports.slice(0, 5), // Last 5 reports
    }
  }

  static async searchLocations(query: string): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true })
      .limit(10)

    if (error) throw error
    return data || []
  }
}