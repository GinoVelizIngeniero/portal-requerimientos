import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/auth'
import { Eye, EyeOff, LogIn } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})
type Form = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPass, setShowPass] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: Form) => {
    setServerError('')
    try {
      const res = await api.post('/auth/login', data)
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken)
      if (res.data.user.mustChangePass) navigate('/change-password')
      else navigate('/dashboard')
    } catch (e: any) {
      setServerError(e.response?.data?.error ?? 'Error de conexión')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-blue to-blue-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-brand-blue px-8 py-8 text-center">
            <div className="w-16 h-16 bg-brand-orange rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <h1 className="text-white text-xl font-bold">Portal de Requerimientos</h1>
            <p className="text-blue-200 text-sm mt-1">Planta Industrial La Calera</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-5">
            <div>
              <label className="label">Correo corporativo</label>
              <input
                {...register('email')}
                type="email"
                placeholder="usuario@sopraval.cl"
                className="input"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
                {serverError}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2">
              <LogIn size={16} />
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center text-blue-200 text-xs mt-4">
          Solo usuarios con cuenta corporativa @sopraval.cl / @agrosuper.com
        </p>
      </div>
    </div>
  )
}
