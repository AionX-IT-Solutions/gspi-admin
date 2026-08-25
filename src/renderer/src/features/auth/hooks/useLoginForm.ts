import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppStore } from '@/app/store/app.store'

const loginSchema = z.object({
  email: z.string().min(1, 'auth.emailRequired').email('auth.emailRequired'),
  password: z.string().min(6, 'auth.passwordMinLength')
})

type LoginFormValues = z.infer<typeof loginSchema>

export function useLoginForm() {
  const login = useAppStore((s) => s.login)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginFormValues) => {
    const result = await login(data.email, data.password)
    if (!result.ok) {
      setError('root', { message: result.message ?? 'auth.errors.generic' })
      return
    }
    const isMaximized = await window.api?.window.isMaximized()
    if (!isMaximized) window.api?.window.maximize()
  }

  const rootError = errors.root?.message
  const emailError = errors.email?.message
  const passwordError = errors.password?.message
  const displayError = rootError ?? emailError ?? passwordError

  return {
    showPassword,
    setShowPassword,
    focusedField,
    setFocusedField,
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    displayError
  }
}
