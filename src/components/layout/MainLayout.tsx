import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useState } from 'react'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar />
      <main className="pl-64 transition-all duration-300 min-h-screen">
        <div className="p-6 lg:p-8 max-w-[1600px]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
