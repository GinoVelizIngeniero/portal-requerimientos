import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useState } from 'react'
import { Plus, Search, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import NuevaSolicitudModal from './NuevaSolicitudModal'
import SolicitudDetailModal from './SolicitudDetailModal'

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  VALORIZADA: 'bg-blue-100 text-blue-800',
  AUTORIZADA: 'bg-green-100 text-green-800',
  POSTERGADA: 'bg-orange-100 text-orange-800',
  RECHAZADA: 'bg-red-100 text-red-800',
}

const MOTIVO_LABELS: Record<string, string> = {
  INOCUIDAD: 'Inocuidad',
  MEDIO_AMBIENTE: 'Medio Ambiente',
  PRODUCTIVIDAD: 'Productividad',
  SEGURIDAD: 'Seguridad',
  SINDICATO: 'Sindicato',
  GERENCIA: 'Gerencia',
}

export default function SolicitudesPage() {
  const qc = useQueryClient()
  const [showNew, setShowNew] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('')

  const { data: solicitudes = [], isLoading } = useQuery({
    queryKey: ['solicitudes'],
    queryFn: () => api.get('/solicitudes').then(r => r.data),
  })

  const filtered = solicitudes.filter((s: any) => {
    const matchSearch = !search || s.titulo.toLowerCase().includes(search.toLowerCase()) || s.area.toLowerCase().includes(search.toLowerCase())
    const matchEstado = !filterEstado || s.estado === filterEstado
    return matchSearch && matchEstado
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Requerimientos de Infraestructura</h1>
          <p className="text-gray-500 text-sm">{solicitudes.length} solicitudes en total</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nueva Solicitud
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por título o área..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-auto" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.keys(ESTADO_COLORS).map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No hay solicitudes</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Título</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Área</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Motivo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Costo Est.</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((sol: any) => (
                  <tr key={sol.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(sol.id)}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-[200px]">{sol.titulo}</p>
                      <p className="text-xs text-gray-400">{sol.creator?.nombre}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{sol.area}{sol.subArea ? ` / ${sol.subArea}` : ''}</td>
                    <td className="px-4 py-3 text-gray-600">{MOTIVO_LABELS[sol.motivo] ?? sol.motivo}</td>
                    <td className="px-4 py-3">
                      <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', ESTADO_COLORS[sol.estado])}>
                        {sol.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {sol.costoEstimado != null ? `$${Number(sol.costoEstimado).toLocaleString('es-CL')}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(sol.createdAt).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight size={16} className="text-gray-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNew && <NuevaSolicitudModal onClose={() => { setShowNew(false); qc.invalidateQueries({ queryKey: ['solicitudes'] }) }} />}
      {selected && <SolicitudDetailModal id={selected} onClose={() => { setSelected(null); qc.invalidateQueries({ queryKey: ['solicitudes'] }) }} />}
    </div>
  )
}
