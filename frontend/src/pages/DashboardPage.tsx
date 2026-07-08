import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'
import { ClipboardList, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#1B3580', '#F07B1B', '#22c55e', '#f97316', '#ef4444']

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: stats } = useQuery({
    queryKey: ['sol-stats'],
    queryFn: () => api.get('/solicitudes/stats/resumen').then(r => r.data),
  })

  const pieData = stats ? [
    { name: 'Pendientes', value: stats.pendientes },
    { name: 'Valorizadas', value: stats.valorizadas },
    { name: 'Autorizadas', value: stats.autorizadas },
    { name: 'Postergadas', value: stats.postergadas },
    { name: 'Rechazadas', value: stats.rechazadas },
  ].filter(d => d.value > 0) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {user?.nombre.split(' ')[0]}</h1>
        <p className="text-gray-500 text-sm mt-1">Portal de Requerimientos de Infraestructura — {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Solicitudes</p>
              <p className="text-3xl font-bold text-brand-blue mt-1">{stats?.total ?? '—'}</p>
            </div>
            <ClipboardList className="text-brand-orange" size={32} />
          </div>
          <p className="text-xs text-gray-400 mt-2">{stats?.pendientes ?? 0} pendientes</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Autorizadas</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats?.autorizadas ?? '—'}</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
          <p className="text-xs text-gray-400 mt-2">{stats?.rechazadas ?? 0} rechazadas</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats?.pendientes ?? '—'}</p>
            </div>
            <Clock className="text-yellow-500" size={32} />
          </div>
          <p className="text-xs text-gray-400 mt-2">{stats?.valorizadas ?? 0} valorizadas</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Postergadas</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats?.postergadas ?? '—'}</p>
            </div>
            <AlertTriangle className="text-orange-500" size={32} />
          </div>
          <p className="text-xs text-gray-400 mt-2">requieren seguimiento</p>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Clock size={16} className="text-brand-orange" />
          Estado de Solicitudes
        </h2>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">Sin datos disponibles</div>
        )}
      </div>
    </div>
  )
}
