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

// Hook for fetching attendance reports
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
    staleTime: 1000 * 60 * 1, // 1 minute
  })
}

// Hook for creating attendance reports
export function useCreateAttendanceReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (report: AttendanceReportInsert) => AttendanceService.createAttendanceReport(report),
    onSuccess: () => {
      // Invalidate and refetch attendance data
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEYS.all })
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
    onSuccess: () => {
      // Invalidate and refetch attendance data
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEYS.all })
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
    onSuccess: () => {
      // Invalidate and refetch attendance data
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEYS.all })
      toast.success('Attendance report deleted successfully!')
    },
    onError: (error: Error) => {
      console.error('Error deleting attendance report:', error)
      toast.error(error.message || 'Failed to delete attendance report')
    },
  })
}