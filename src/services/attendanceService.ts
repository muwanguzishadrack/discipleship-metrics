import { supabase } from '@/lib/supabase'
import { AttendanceReportInsert, AttendanceReportUpdate } from '@/types/database'

export interface AttendanceFilters {
  dateFilter?: string
  customDateRange?: { from?: Date; to?: Date }
  tierFilter?: string
  page?: number
  pageSize?: number
}

export interface DashboardMetrics {
  sv1: number
  sv2: number
  yxp: number
  kids: number
  local: number
  hc1: number
  hc2: number
  overall: number
}

export class AttendanceService {
  static async getAttendanceReports(filters: AttendanceFilters = {}) {
    let query = supabase
      .from('attendance_reports')
      .select(`
        *,
        location:locations(id, name, address)
      `)
      .order('date', { ascending: false })

    // Apply date filtering
    if (filters.dateFilter && filters.dateFilter !== 'all') {
      const dateRange = this.getDateRange(filters.dateFilter, filters.customDateRange)
      if (dateRange) {
        query = query.gte('date', dateRange.from).lte('date', dateRange.to)
      }
    }

    // Apply tier filtering
    if (filters.tierFilter && filters.tierFilter !== 'all') {
      query = query.eq('tier', filters.tierFilter)
    }

    // Apply pagination
    if (filters.page && filters.pageSize) {
      const from = (filters.page - 1) * filters.pageSize
      const to = from + filters.pageSize - 1
      query = query.range(from, to)
    }

    const { data, error, count } = await query

    if (error) throw error

    return { data: data || [], count: count || 0 }
  }

  static async createAttendanceReport(report: AttendanceReportInsert) {
    const { data, error } = await supabase
      .from('attendance_reports')
      .insert(report)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateAttendanceReport(id: string, updates: AttendanceReportUpdate) {
    const { data, error } = await supabase
      .from('attendance_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteAttendanceReport(id: string) {
    const { error } = await supabase
      .from('attendance_reports')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async getDashboardMetrics(filters: AttendanceFilters = {}): Promise<DashboardMetrics> {
    let query = supabase
      .from('attendance_reports')
      .select('sv1, sv2, yxp, kids, local, hc1, hc2, total_attendance')

    // Apply date filtering
    if (filters.dateFilter && filters.dateFilter !== 'all') {
      const dateRange = this.getDateRange(filters.dateFilter, filters.customDateRange)
      if (dateRange) {
        query = query.gte('date', dateRange.from).lte('date', dateRange.to)
      }
    }

    const { data, error } = await query

    if (error) throw error

    // Calculate totals
    const metrics = data?.reduce(
      (acc, report) => ({
        sv1: acc.sv1 + (report.sv1 || 0),
        sv2: acc.sv2 + (report.sv2 || 0),
        yxp: acc.yxp + (report.yxp || 0),
        kids: acc.kids + (report.kids || 0),
        local: acc.local + (report.local || 0),
        hc1: acc.hc1 + (report.hc1 || 0),
        hc2: acc.hc2 + (report.hc2 || 0),
        overall: acc.overall + (report.total_attendance || 0),
      }),
      { sv1: 0, sv2: 0, yxp: 0, kids: 0, local: 0, hc1: 0, hc2: 0, overall: 0 }
    ) || { sv1: 0, sv2: 0, yxp: 0, kids: 0, local: 0, hc1: 0, hc2: 0, overall: 0 }

    return metrics
  }

  private static getDateRange(
    dateFilter: string,
    customRange?: { from?: Date; to?: Date }
  ): { from: string; to: string } | null {
    const now = new Date()
    let from: Date
    let to: Date = now

    switch (dateFilter) {
      case 'this-week':
        const dayOfWeek = now.getDay()
        from = new Date(now)
        from.setDate(now.getDate() - dayOfWeek)
        from.setHours(0, 0, 0, 0)
        to = new Date(from)
        to.setDate(from.getDate() + 6)
        to.setHours(23, 59, 59, 999)
        break

      case 'last-week':
        const lastWeekEnd = new Date(now)
        lastWeekEnd.setDate(now.getDate() - now.getDay() - 1)
        lastWeekEnd.setHours(23, 59, 59, 999)
        from = new Date(lastWeekEnd)
        from.setDate(lastWeekEnd.getDate() - 6)
        from.setHours(0, 0, 0, 0)
        to = lastWeekEnd
        break

      case 'this-month':
        from = new Date(now.getFullYear(), now.getMonth(), 1)
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        to.setHours(23, 59, 59, 999)
        break

      case 'last-month':
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        to = new Date(now.getFullYear(), now.getMonth(), 0)
        to.setHours(23, 59, 59, 999)
        break

      case 'custom-range':
        if (customRange?.from && customRange?.to) {
          from = customRange.from
          to = customRange.to
        } else {
          return null
        }
        break

      default:
        return null
    }

    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    }
  }
}