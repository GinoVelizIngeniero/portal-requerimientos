import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../../lib/api'
import { X } from 'lucide-react'
import { useState } from 'react'

const AREAS = ['A - Crianza', 'B - Faena', 'C - Proceso', 'D - Frío', 'E - Despacho', 'F - Mantención', 'G - Administración']
const MOTIVOS = ['INOCUIDAD', 'MEDIO_AMBIENTE', 'PRODUCTIVIDAD', 'SEGURIDAD', 'SINDICATO', 'GERENCIA']

const schema = z.object({
  titulo: z.string().min(3, 'Mínimo 3 caracteres'),
  descripcion: z.string().min(10, 'Mínimo 10 caracteres'),
  area: z.string().min(1, 'Seleccione un área'),
  subArea: z.string().optional(),
  motivo: z.enum(['INOCUIDAD', 'MEDIO_AMBIENTE', 'PRODUCTIVIDAD', 'SEGURIDAD', 'SINDICATO', 'GERENCIA']),
})
type Form = z.infer<typeof schema>

export default function NuevaSolicitudModal({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: Form) => {
    setError('')
    try {
      await api.post('/solicitudes', data)
      onClose()
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Error al crear')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">Nueva Solicitud de Infraestructura</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="label">Título *</label>
            <input {...register('titulo')} className="input" placeholder="Descripción corta del requerimiento" />
            {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo.message}</p>}
          </div>

          <div>
            <label className="label">Descripción *</label>
            <textarea {...register('descripcion')} rows={3} className="input resize-none" placeholder="Describe el requerimiento con detalle..." />
            {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Área *</label>
              <select {...register('area')} className="input">
                <option value="">Seleccionar</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area.message}</p>}
            </div>
            <div>
              <label className="label">Sub-área</label>
              <input {...register('subArea')} className="input" placeholder="Opcional" />
            </div>
          </div>

          <div>
            <label className="label">Motivo *</label>
            <select {...register('motivo')} className="input">
              <option value="">Seleccionar</option>
              {MOTIVOS.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
            </select>
            {errors.motivo && <p className="text-red-500 text-xs mt-1">{errors.motivo.message}</p>}
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
