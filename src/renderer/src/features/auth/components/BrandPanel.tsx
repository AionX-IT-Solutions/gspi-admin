import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { ParticleBackground } from '@/shared/components/ParticleBackground'
import { GlowRing } from '@/shared/components/GlowEffect'

const FEATURES = [
  'Point of Sale & Inventory',
  'HR, Attendance & Payroll',
  'Accounting, Invoices & Vendors',
  'Cash Receipts & Vouchers',
  'Rental Bookings & Facility',
  'Troops & Membership',
  'Goals & Objectives'
]

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } }
}

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } }
}

export function BrandPanel() {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 360,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #0d3320 0%, #14472c 45%, #0a2116 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 40px'
      }}
    >
      {/* Animated particle network — the "futuristic" data-mesh layer */}
      <ParticleBackground />

      <motion.div
        aria-hidden
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.32), transparent 70%)',
          filter: 'blur(10px)',
          pointerEvents: 'none'
        }}
      />
      <motion.div
        aria-hidden
        animate={{ y: [0, 16, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: '8%',
          right: '8%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74,222,128,0.28), transparent 70%)',
          filter: 'blur(10px)',
          pointerEvents: 'none'
        }}
      />
      <motion.div
        aria-hidden
        animate={{ opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '45%',
          left: '55%',
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.22), transparent 70%)',
          filter: 'blur(20px)',
          pointerEvents: 'none'
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 260,
          height: 260,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.08)',
          pointerEvents: 'none'
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: -100,
          left: -60,
          width: 300,
          height: 300,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.06)',
          pointerEvents: 'none'
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          maxWidth: 360,
          flexShrink: 0
        }}
      >
        {/* Logo — significantly larger, with an animated glow ring + pulsing halo */}
        <div
          style={{
            position: 'relative',
            width: 168,
            height: 168,
            margin: '0 auto 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(74,222,128,0.35), transparent 72%)',
              filter: 'blur(18px)',
              animation: 'pulse-glow 3.5s ease-in-out infinite'
            }}
          />
          <div style={{ position: 'absolute', inset: -6 }}>
            <GlowRing color="#4ade80" size={180} strokeWidth={1.5} />
          </div>
          <div
            style={{
              position: 'relative',
              width: 128,
              height: 128,
              borderRadius: 32,
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="GSP Ilocos"
              style={{ width: 92, height: 92, objectFit: 'contain', display: 'block' }}
              draggable={false}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.14)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.75)',
            marginBottom: 16
          }}
        >
          <ShieldCheck size={12} /> Girl Scouts of the Philippines
        </div>

        <h1
          style={{
            fontSize: 34,
            fontWeight: 900,
            letterSpacing: '0.03em',
            marginBottom: 8,
            backgroundImage: 'linear-gradient(135deg, #ffffff 30%, #86efac 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            textShadow: '0 0 30px rgba(34,197,94,0.45)'
          }}
        >
          GSP ILOCOS
        </h1>
        <p
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.65)',
            marginBottom: 26,
            lineHeight: 1.5
          }}
        >
          Ilocos Sur Council · Business, HR &amp; Financial Management System
        </p>

        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="show"
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f}
              variants={itemVariants}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 14px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#4ade80',
                  boxShadow: '0 0 8px rgba(74,222,128,0.9)',
                  flexShrink: 0
                }}
              />
              <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)' }}>{f}</span>
            </motion.div>
          ))}
        </motion.div>

        <div
          style={{
            marginTop: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10
          }}
        >
          <img
            src={`${import.meta.env.BASE_URL}aionx-logo.png`}
            alt="AionX"
            style={{ width: 52, height: 52, objectFit: 'contain', display: 'block', flexShrink: 0 }}
            draggable={false}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <span style={{ marginLeft: -15, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            Powered by AionX IT Solutions
          </span>
        </div>
      </motion.div>
    </div>
  )
}
