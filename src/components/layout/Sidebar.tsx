import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Bot, 
  CheckSquare, 
  Wallet, 
  Users, 
  Briefcase, 
  Clapperboard, 
  FlaskConical, 
  FileBarChart, 
  Scale,
  Globe,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../../lib/utils'

const navItems = [
  { path: '/', icon: LayoutDashboard, key: 'dashboard' as const },
  { path: '/ai-employees', icon: Bot, key: 'aiEmployees' as const },
  { path: '/tasks', icon: CheckSquare, key: 'tasks' as const },
  { path: '/finance', icon: Wallet, key: 'finance' as const },
  { path: '/clients', icon: Users, key: 'clients' as const },
  { path: '/agency', icon: Briefcase, key: 'agency' as const },
  { path: '/media', icon: Clapperboard, key: 'media' as const },
  { path: '/labs', icon: FlaskConical, key: 'labs' as const },
  { path: '/reports', icon: FileBarChart, key: 'reports' as const },
  { path: '/ceo-decisions', icon: Scale, key: 'ceoDecisions' as const },
]

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ mobileOpen, onMobileClose, collapsed, onToggleCollapse }: SidebarProps) {
  const { t } = useTranslation()
  const language = useAppStore(s => s.language)
  const setLanguage = useAppStore(s => s.setLanguage)
  const location = useLocation()

  // Close mobile menu on route change
  useEffect(() => {
    onMobileClose()
  }, [location.pathname])

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-surface-900 text-slate-300 flex flex-col transition-all duration-300",
          // Desktop
          "lg:translate-x-0",
          collapsed ? "lg:w-[72px]" : "lg:w-64",
          // Mobile: slide in/out
          "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 px-4 h-16 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-namt-400 to-namt-600 flex items-center justify-center text-white font-bold text-sm">
              N
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="overflow-hidden">
                <div className="font-semibold text-white text-sm leading-tight">NAMT</div>
                <div className="text-[11px] text-slate-400 leading-tight">CEO Control Center</div>
              </div>
            )}
          </div>
          {/* Close on mobile */}
          <button 
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-namt-600/20 text-namt-300" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {(!collapsed || mobileOpen) && <span>{t(item.key)}</span>}
            </NavLink>
          ))}
        </nav>
        
        {/* Bottom */}
        <div className="border-t border-slate-800 p-3 space-y-1">
          <button
            onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <Globe className="w-5 h-5 flex-shrink-0" />
            {(!collapsed || mobileOpen) && <span>{language === 'ru' ? 'English' : 'Русский'}</span>}
          </button>
          
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
            <Bell className="w-5 h-5 flex-shrink-0" />
            {(!collapsed || mobileOpen) && <span>{t('notifications')}</span>}
          </button>
          
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
            <Settings className="w-5 h-5 flex-shrink-0" />
            {(!collapsed || mobileOpen) && <span>{t('settings')}</span>}
          </button>
          
          {/* Profile */}
          <div className={cn(
            "flex items-center gap-3 px-3 py-2.5 mt-2",
            collapsed && !mobileOpen && "justify-center"
          )}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-namt-400 to-namt-700 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              CEO
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="overflow-hidden">
                <div className="text-sm font-medium text-white truncate">Founder / CEO</div>
                <div className="text-xs text-slate-400 truncate">NAMT Group</div>
              </div>
            )}
          </div>
          
          {/* Collapse only on desktop */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center py-2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </aside>
    </>
  )
}

export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const language = useAppStore(s => s.language)
  const setLanguage = useAppStore(s => s.setLanguage)

  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200">
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-namt-400 to-namt-600 flex items-center justify-center text-white text-xs font-bold">
          N
        </div>
        <span className="font-semibold text-slate-900 text-sm">NAMT</span>
      </div>

      <button
        onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
        className="p-2 -mr-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-medium uppercase"
      >
        {language === 'ru' ? 'EN' : 'RU'}
      </button>
    </header>
  )
}
