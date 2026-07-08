import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import {
  LayoutDashboard, ClipboardList, Users, LogOut, Menu, X, ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { api } from '../../lib/api'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['USER', 'JEFE_AREA', 'MANTENIMIENTO', 'SUPERVISOR', 'GERENTE', 'ADMIN'] },
  { to: '/solicitudes', label: 'Requerimientos', icon: ClipboardList, roles: ['USER', 'JEFE_AREA', 'MANTENIMIENTO', 'SUPERVISOR', 'GERENTE', 'ADMIN'] },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users, roles: ['ADMIN', 'GERENTE'] },
]

export default function AppLayout() {
  const { user, clearAuth, refreshToken } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await api.post('/auth/logout', { refreshToken }).catch(() => {})
    clearAuth()
    navigate('/login')
  }

  const filtered = navItems.filter((n) => user && n.roles.includes(user.role))

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-40 flex flex-col bg-brand-blue text-white transition-all duration-300',
        open ? 'w-64' : 'w-16',
        'lg:relative lg:w-64 lg:flex'
      )}>
        <div className="flex items-center gap-3 p-4 border-b border-blue-700 min-h-[64px]">
          <div className="flex-shrink-0 w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center font-bold text-sm">
            S
          </div>
          {open && <span className="font-bold text-sm tracking-wide">Portal Requerimientos</span>}
          <span className="hidden lg:block font-bold text-sm tracking-wide">Portal Requerimientos</span>
        </div>

        <nav className="flex-1 p-2 space-y-1 mt-2">
          {filtered.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-brand-orange text-white' : 'text-blue-200 hover:bg-blue-700 hover:text-white'
              )}
              onClick={() => setOpen(false)}
            >
              <item.icon size={18} className="flex-shrink-0" />
              <span className={clsx('truncate', !open && 'lg:block hidden')}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-blue-700">
          <div className={clsx('flex items-center gap-3', !open && 'lg:flex hidden')}>
            <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.nombre.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.nombre}</p>
              <p className="text-xs text-blue-300 truncate">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="text-blue-300 hover:text-white">
              <LogOut size={16} />
            </button>
          </div>
          <button
            onClick={handleLogout}
            className={clsx('flex items-center gap-2 text-blue-300 hover:text-white text-xs mt-1', open ? 'hidden' : 'flex lg:hidden')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between lg:px-6">
          <button className="lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ChevronRight size={14} />
            <span className="font-medium text-gray-900">{user?.nombre}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
