import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, ArrowRight, Lock, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/app.store'

const loginSchema = z.object({
  username: z.string().min(1, 'auth.usernameRequired'),
  password: z.string().min(4, 'auth.passwordMinLength')
})

type LoginForm = z.infer<typeof loginSchema>

export function Login() {
  const { t } = useTranslation()
  const login = useAppStore((s) => s.login)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginForm) => {
    await new Promise((r) => setTimeout(r, 800))
    const ok = login(data.username, data.password)
    if (!ok) {
      setError('root', { message: t('auth.passwordMinLength') })
    }
  }

  const rootError = errors.root?.message
  const usernameError = errors.username?.message
  const passwordError = errors.password?.message
  const displayError = rootError ?? usernameError ?? passwordError

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '24px'
      }}
    >
      {/* Ambient glow blobs */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'var(--accent-primary)',
          opacity: 0.06,
          filter: 'blur(100px)',
          pointerEvents: 'none'
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '20%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'var(--accent-cyan)',
          opacity: 0.05,
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.45,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          delay: 0.05
        }}
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid var(--glass-border)',
          borderRadius: '20px',
          boxShadow:
            '0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px var(--accent-primary-subtle), inset 0 1px 0 rgba(255,255,255,0.07)',
          padding: '40px 36px 36px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Top shimmer line */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)',
            opacity: 0.6
          }}
        />

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <motion.div
            animate={{
              filter: [
                'drop-shadow(0 0 10px rgba(232,24,92,0.4))',
                'drop-shadow(0 0 22px rgba(232,24,92,0.7))',
                'drop-shadow(0 0 10px rgba(232,24,92,0.4))'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ display: 'inline-flex', marginBottom: '8px' }}
          >
            <img
              src={`${import.meta.env.BASE_URL}aionx-logo.png`}
              alt="AionX"
              style={{ width: '90px', height: 'auto', objectFit: 'contain', display: 'block' }}
              draggable={false}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </motion.div>

          {/* Brand wordmark */}
          <motion.div
            animate={{
              filter: [
                'drop-shadow(0 0 6px rgba(232,24,92,0.35))',
                'drop-shadow(0 0 14px rgba(232,24,92,0.6))',
                'drop-shadow(0 0 6px rgba(232,24,92,0.35))'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              fontFamily: "'JetBrains Mono Variable','JetBrains Mono',monospace",
              fontWeight: 800,
              fontSize: '28px',
              letterSpacing: '6px',
              background: 'linear-gradient(90deg, #FFD600 0%, #FF9800 50%, #E8185C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '12px',
              userSelect: 'none'
            }}
          >
            AIONX
          </motion.div>

          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '6px'
            }}
          >
            {t('auth.welcomeBack')}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {t('auth.signInSubtitle')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Username */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.02em'
                }}
              >
                {t('auth.username')}
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '11px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color:
                      focusedField === 'username' ? 'var(--accent-primary)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                    transition: 'color 0.15s ease'
                  }}
                >
                  <User size={14} />
                </span>
                <input
                  type="text"
                  {...register('username')}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={t('auth.usernamePlaceholder')}
                  autoComplete="username"
                  style={{
                    width: '100%',
                    height: '40px',
                    paddingLeft: '34px',
                    paddingRight: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${errors.username ? 'rgba(239,68,68,0.6)' : focusedField === 'username' ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    boxShadow: errors.username
                      ? '0 0 0 3px rgba(239,68,68,0.15)'
                      : focusedField === 'username'
                        ? '0 0 0 3px var(--accent-primary-glow)'
                        : 'none'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.02em'
                }}
              >
                {t('auth.password')}
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '11px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color:
                      focusedField === 'password' ? 'var(--accent-primary)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                    transition: 'color 0.15s ease'
                  }}
                >
                  <Lock size={14} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={t('auth.passwordPlaceholder')}
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    height: '40px',
                    paddingLeft: '34px',
                    paddingRight: '40px',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${errors.password ? 'rgba(239,68,68,0.6)' : focusedField === 'password' ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    boxShadow: errors.password
                      ? '0 0 0 3px rgba(239,68,68,0.15)'
                      : focusedField === 'password'
                        ? '0 0 0 3px var(--accent-primary-glow)'
                        : 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                    borderRadius: '4px',
                    transition: 'color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  {showPassword ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {displayError && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '9px 12px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: '8px',
                    color: '#f87171',
                    fontSize: '12px',
                    overflow: 'hidden'
                  }}
                >
                  <AlertCircle size={13} style={{ flexShrink: 0 }} />
                  {t(displayError)}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              whileTap={isSubmitting ? {} : { scale: 0.97 }}
              disabled={isSubmitting}
              style={{
                width: '100%',
                height: '42px',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'var(--accent-primary)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.75 : 1,
                fontFamily: 'inherit',
                boxShadow: '0 0 24px var(--accent-primary-glow)',
                transition: 'opacity 0.15s ease, box-shadow 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting)
                  e.currentTarget.style.boxShadow = '0 0 36px var(--accent-primary-glow)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 24px var(--accent-primary-glow)'
              }}
            >
              {isSubmitting ? (
                <svg
                  style={{ width: '16px', height: '16px', animation: 'spin 0.8s linear infinite' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              ) : (
                <>
                  {t('common.signIn')}
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </div>
        </form>

        <p
          style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '11px',
            color: 'var(--text-muted)',
            lineHeight: '1.5'
          }}
        >
          {t('auth.demo')}
        </p>
      </motion.div>
    </motion.div>
  )
}
