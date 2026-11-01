import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar, MobileHeader } from './Sidebar'
import { cn } from '../../lib/utils'

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar 
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />
      
      <div className={cn(
        "transition-all duration-300 min-h-screen",
        collapsed ? "lg:pl-[72px]" : "lg:pl-64"
      )}>
        <MobileHeader onMenuClick={() => setMobileOpen(true)} />
        
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
