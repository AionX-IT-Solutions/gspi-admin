import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLoginForm } from '../hooks/useLoginForm'

const CORNER_SIZE = 18

function Corner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const vertical = position[0] === 't' ? 'top' : 'bottom'
  const horizontal = position[1] === 'l' ? 'left' : 'right'
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        [vertical]: -1,
        [horizontal]: -1,
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        borderTop: vertical === 'top' ? '2px solid var(--accent-primary)' : undefined,
        borderBottom: vertical === 'bottom' ? '2px solid var(--accent-primary)' : undefined,
        borderLeft: horizontal === 'left' ? '2px solid var(--accent-primary)' : undefined,
        borderRight: horizontal === 'right' ? '2px solid var(--accent-primary)' : undefined,
        borderTopLeftRadius: position === 'tl' ? 20 : undefined,
        borderTopRightRadius: position === 'tr' ? 20 : undefined,
        borderBottomLeftRadius: position === 'bl' ? 20 : undefined,
        borderBottomRightRadius: position === 'br' ? 20 : undefined,
        opacity: 0.6,
        pointerEvents: 'none'
      }}
    />
  )
}

export function LoginForm() {
  const { t } = useTranslation()
  const {
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
  } = useLoginForm()

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        delay: 0.05
      }}
      style={{ width: '100%', maxWidth: 410, position: 'relative', margin: '24px 0' }}
    >
      <div
        style={{
          position: 'relative',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid var(--glass-border)',
          borderRadius: 22,
          boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 4px 20px rgba(0,0,0,0.1)',
          padding: '38px 38px 34px',
          overflow: 'hidden'
        }}
      >
        {/* Top edge accent — a soft gradient bar rather than a flat rule */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: 2,
            background:
              'linear-gradient(90deg, transparent, var(--accent-primary), var(--accent-cyan), transparent)',
            opacity: 0.8
          }}
        />
        <Corner position="tl" />
        <Corner position="tr" />
        <Corner position="bl" />
        <Corner position="br" />

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent-primary)',
            marginBottom: 10
          }}
        >
          <Sparkles size={12} />
          {t('auth.welcomeBack')}
        </div>
        <h2
          style={{
            fontSize: 23,
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: 6
          }}
        >
          Sign in to your account
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28 }}>
          {t('auth.signInSubtitle')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.02em'
                }}
              >
                {t('auth.email')}
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '11px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: focusedField === 'email' ? 'var(--accent-primary)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                    transition: 'color 0.15s ease'
                  }}
                >
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  {...register('email')}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={t('auth.emailPlaceholder')}
                  autoComplete="email"
                  style={{
                    width: '100%',
                    height: '42px',
                    paddingLeft: '34px',
                    paddingRight: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${errors.email ? 'rgba(239,68,68,0.6)' : focusedField === 'email' ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    boxShadow: errors.email
                      ? '0 0 0 3px rgba(239,68,68,0.15)'
                      : focusedField === 'email'
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
                    height: '42px',
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
                position: 'relative',
                width: '100%',
                height: '44px',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background:
                  'linear-gradient(120deg, var(--accent-primary) 0%, var(--accent-cyan) 45%, var(--accent-primary) 100%)',
                backgroundSize: '220% auto',
                animation: isSubmitting ? undefined : 'shimmer 4.5s linear infinite',
                border: 'none',
                borderRadius: '11px',
                color: '#fff',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.75 : 1,
                fontFamily: 'inherit',
                boxShadow: '0 0 26px var(--accent-primary-glow)',
                transition: 'opacity 0.15s ease, box-shadow 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting)
                  e.currentTarget.style.boxShadow = '0 0 38px var(--accent-primary-glow)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 26px var(--accent-primary-glow)'
              }}
            >
              {isSubmitting ? (
                <svg
                  style={{
                    width: '16px',
                    height: '16px',
                    animation: 'spin 0.8s linear infinite'
                  }}
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
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '11px',
            color: 'var(--text-muted)',
            lineHeight: '1.5'
          }}
        >
          {t('auth.demo')}
        </p>
      </div>
    </motion.div>
  )
}
