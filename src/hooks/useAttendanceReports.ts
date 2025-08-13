import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AttendanceService, AttendanceFilters } from '@/services/attendanceService'
import { AttendanceReportInsert, AttendanceReportUpdate } from '@/types/database'
import { toast } from 'sonner'

// Query Keys
export const ATTENDANCE_QUERY_KEYS = {
  all: ['attendance'] as const,
  reports: (filters: AttendanceFilters) => [...ATTENDANCE_QUERY_KEYS.all, 'reports', filters] as const,
  metrics: (filters: AttendanceFilters) => [...ATTENDANCE_QUERY_KEYS.all, 'metrics', filters] as const,
}

// Hook for fetching all attendance reports (for client-side pagination/filtering)
export function useAllAttendanceReports(filters: Omit<AttendanceFilters, 'page' | 'pageSize'> = {}) {
  return useQuery({
    queryKey: ['attendance', 'all-reports', filters],
    queryFn: () => AttendanceService.getAllAttendanceReports(filters),
    staleTime: 1000 * 60 * 15, // 15 minutes - longer cache for better performance
    select: (data) => data.data || [],
  })
}

// Hook for fetching attendance reports (kept for backward compatibility)
export function useAttendanceReports(filters: AttendanceFilters = {}) {
  return useQuery({
    queryKey: ATTENDANCE_QUERY_KEYS.reports(filters),
    queryFn: () => AttendanceService.getAttendanceReports(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    select: (data) => ({
      reports: data.data,
      totalCount: data.count,
      totalPages: filters.pageSize ? Math.ceil(data.count / filters.pageSize) : 1,
    }),
  })
}

// Hook for fetching dashboard metrics
export function useDashboardMetrics(filters: AttendanceFilters = {}) {
  return useQuery({
    queryKey: ATTENDANCE_QUERY_KEYS.metrics(filters),
    queryFn: () => AttendanceService.getDashboardMetrics(filters),
    staleTime: 1000 * 60 * 10, // 10 minutes - longer cache for better performance
  })
}

// Hook for creating attendance reports
export function useCreateAttendanceReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (report: AttendanceReportInsert) => AttendanceService.createAttendanceReport(report),
    onSuccess: (newReport) => {
      // Optimistic update: add the new report to existing cache
      queryClient.setQueryData(['attendance', 'all-reports'], (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: [newReport, ...old.data].sort((a, b) => (b.total_attendance || 0) - (a.total_attendance || 0))
        }
      })
      
      // Only invalidate specific queries that need refreshing
      queryClient.invalidateQueries({ queryKey: ['attendance', 'all-reports'] })
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEYS.metrics({}) })
      
      toast.success('Attendance report created successfully!')
    },
    onError: (error: Error) => {
      console.error('Error creating attendance report:', error)
      toast.error(error.message || 'Failed to create attendance report')
    },
  })
}

// Hook for updating attendance reports
export function useUpdateAttendanceReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: AttendanceReportUpdate }) =>
      AttendanceService.updateAttendanceReport(id, updates),
    onSuccess: (updatedReport, { id }) => {
      // Optimistic update: update the specific report in cache
      queryClient.setQueryData(['attendance', 'all-reports'], (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.map((report: any) => 
            report.id === id ? updatedReport : report
          ).sort((a: any, b: any) => (b.total_attendance || 0) - (a.total_attendance || 0))
        }
      })
      
      // Only invalidate specific queries that need refreshing
      queryClient.invalidateQueries({ queryKey: ['attendance', 'all-reports'] })
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEYS.metrics({}) })
      
      toast.success('Attendance report updated successfully!')
    },
    onError: (error: Error) => {
      console.error('Error updating attendance report:', error)
      toast.error(error.message || 'Failed to update attendance report')
    },
  })
}

// Hook for deleting attendance reports
export function useDeleteAttendanceReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => AttendanceService.deleteAttendanceReport(id),
    onSuccess: (_, deletedId) => {
      // Optimistic update: remove the deleted report from cache
      queryClient.setQueryData(['attendance', 'all-reports'], (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.filter((report: any) => report.id !== deletedId)
        }
      })
      
      // Only invalidate specific queries that need refreshing
      queryClient.invalidateQueries({ queryKey: ['attendance', 'all-reports'] })
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEYS.metrics({}) })
      
      toast.success('Attendance report deleted successfully!')
    },
    onError: (error: Error) => {
      console.error('Error deleting attendance report:', error)
      toast.error(error.message || 'Failed to delete attendance report')
    },
  })
}