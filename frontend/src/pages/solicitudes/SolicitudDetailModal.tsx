import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/auth'
import { X, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

export default function SolicitudDetailModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [costo, setCosto] = useState('')
  const [notas, setNotas] = useState('')
  const [comentario, setComentario] = useState('')

  const { data: sol, isLoading } = useQuery({
    queryKey: ['solicitud', id],
    queryFn: () => api.get(`/solicitudes/${id}`).then(r => r.data),
  })

  const update = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.patch(`/solicitudes/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['solicitud', id] }),
  })

  const canEditCosto = user?.role === 'MANTENIMIENTO'
  const canDecide = user?.role === 'GERENTE' || user?.role === 'ADMIN'

  if (isLoading) return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 text-gray-400">Cargando...</div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{sol?.titulo}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Solicitado por {sol?.creator?.nombre} — {new Date(sol?.createdAt).toLocaleDateString('es-CL')}</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="label mb-0">Estado:</span>
            <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold',
              sol?.estado === 'AUTORIZADA' ? 'bg-green-100 text-green-700' :
              sol?.estado === 'RECHAZADA' ? 'bg-red-100 text-red-700' :
              sol?.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' :
              'bg-blue-100 text-blue-700'
            )}>
              {sol?.estado}
            </span>
          </div>

          <div>
            <p className="label">Descripción</p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{sol?.descripcion}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="label">Área</span><p className="text-gray-700">{sol?.area}{sol?.subArea ? ` / ${sol.subArea}` : ''}</p></div>
            <div><span className="label">Motivo</span><p className="text-gray-700">{sol?.motivo}</p></div>
          </div>

          {canEditCosto && sol?.estado === 'PENDIENTE' && (
            <div className="bg-blue-50 rounded-xl p-4 space-y-3">
              <h3 className="font-medium text-brand-blue text-sm flex items-center gap-2"><DollarSign size={15} /> Valorización</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Costo estimado ($)</label>
                  <input type="number" className="input" value={costo} onChange={e => setCosto(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="label">Notas técnicas</label>
                  <input className="input" value={notas} onChange={e => setNotas(e.target.value)} placeholder="Observaciones..." />
                </div>
              </div>
              <button
                className="btn-primary text-sm"
                onClick={() => update.mutate({ estado: 'VALORIZADA', costoEstimado: Number(costo), notasMantenimiento: notas })}
              >
                Enviar Valorización
              </button>
            </div>
          )}

          {sol?.costoEstimado != null && (
            <div className="text-sm">
              <span className="label">Costo estimado</span>
              <p className="text-gray-700 font-semibold">${Number(sol.costoEstimado).toLocaleString('es-CL')}</p>
              {sol.notasMantenimiento && <p className="text-gray-500 text-xs mt-1">{sol.notasMantenimiento}</p>}
            </div>
          )}

          {canDecide && sol?.estado === 'VALORIZADA' && (
            <div className="bg-yellow-50 rounded-xl p-4 space-y-3">
              <h3 className="font-medium text-yellow-800 text-sm">Decisión Gerencia</h3>
              <div>
                <label className="label">Comentario</label>
                <textarea className="input" rows={2} value={comentario} onChange={e => setComentario(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button
                  className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
                  onClick={() => update.mutate({ estado: 'AUTORIZADA', comentarioGerente: comentario })}
                >
                  <CheckCircle size={15} /> Autorizar
                </button>
                <button
                  className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 flex items-center justify-center gap-2"
                  onClick={() => update.mutate({ estado: 'POSTERGADA', comentarioGerente: comentario })}
                >
                  <Clock size={15} /> Postergar
                </button>
                <button
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 flex items-center justify-center gap-2"
                  onClick={() => update.mutate({ estado: 'RECHAZADA', comentarioGerente: comentario })}
                >
                  <XCircle size={15} /> Rechazar
                </button>
              </div>
            </div>
          )}

          {sol?.comentarioGerente && (
            <div className="text-sm">
              <span className="label">Comentario Gerencia</span>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{sol.comentarioGerente}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
