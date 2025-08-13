import { Outlet } from 'react-router-dom'
import { Topbar } from './Topbar'

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-x-0 top-0 h-[300px] bg-gradient-to-r from-[#13192b] to-[#1c2334]" />
      <div className="relative z-10">
        <Topbar />
        <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
