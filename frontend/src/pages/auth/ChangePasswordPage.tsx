import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/auth'
import { useState } from 'react'
import { KeyRound } from 'lucide-react'

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Las contraseñas no coinciden', path: ['confirmPassword'] })

type Form = z.infer<typeof schema>

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const { updateUser } = useAuthStore()
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Form) => {
    setError('')
    try {
      await api.post('/auth/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword })
      updateUser({ mustChangePass: false })
      navigate('/dashboard')
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Error al cambiar contraseña')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-blue to-blue-900 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-brand-blue px-8 py-6 text-center">
          <KeyRound className="text-brand-orange mx-auto mb-2" size={32} />
          <h1 className="text-white font-bold text-lg">Cambio de Contraseña Requerido</h1>
          <p className="text-blue-200 text-sm mt-1">Por seguridad, debes cambiar tu contraseña inicial</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-4">
          <div>
            <label className="label">Contraseña actual</label>
            <input {...register('currentPassword')} type="password" className="input" placeholder="Sopraval2026" />
            {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
          </div>
          <div>
            <label className="label">Nueva contraseña</label>
            <input {...register('newPassword')} type="password" className="input" placeholder="Mínimo 8 caracteres" />
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label className="label">Confirmar nueva contraseña</label>
            <input {...register('confirmPassword')} type="password" className="input" />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">{error}</div>}
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Guardando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
