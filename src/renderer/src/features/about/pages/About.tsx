import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { useElectron } from '@/app/hooks/useElectron'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

const techStack = [
  { name: 'Electron', variant: 'cyan' as const },
  { name: 'React 19', variant: 'primary' as const },
  { name: 'Vite 6', variant: 'success' as const },
  { name: 'TypeScript', variant: 'primary' as const },
  { name: 'Tailwind CSS', variant: 'cyan' as const },
  { name: 'Framer Motion', variant: 'warning' as const },
  { name: 'Zustand', variant: 'success' as const },
  { name: 'Radix UI', variant: 'default' as const },
  { name: 'Lucide React', variant: 'default' as const }
]

export function About() {
  const { t } = useTranslation()
  const { appVersion } = useElectron()

  const buildInfo = [
    { label: t('about.buildToolLabel'), value: 'electron-vite' },
    { label: t('about.nodeTargetLabel'), value: 'ES2022' },
    { label: t('about.rendererTargetLabel'), value: 'Chromium 130+' },
    { label: t('about.architectureLabel'), value: 'x64 / arm64' },
    { label: t('about.licenseLabel'), value: 'MIT' }
  ]

  return (
    <motion.div
      key="about"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          style={{ textAlign: 'center', marginBottom: '40px', paddingTop: '16px' }}
        >
          {/* Logo */}
          <motion.div
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}
            animate={{
              filter: [
                'drop-shadow(0 0 10px rgba(232,24,92,0.4))',
                'drop-shadow(0 0 24px rgba(232,24,92,0.75))',
                'drop-shadow(0 0 10px rgba(232,24,92,0.4))'
              ]
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="AionX"
              style={{ width: '250px', height: 'auto', objectFit: 'contain', display: 'block' }}
              draggable={false}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </motion.div>

          {/* Version */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.22 }}
            style={{ marginBottom: '12px' }}
          >
            <Badge variant="primary" style={{ fontSize: '12px', padding: '4px 12px' }}>
              v{appVersion}
            </Badge>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.28 }}
            style={{
              fontSize: '15px',
              color: 'var(--text-secondary)',
              lineHeight: '1.5',
              maxWidth: '420px',
              margin: '0 auto 24px'
            }}
          >
            {t('about.tagline')}
          </motion.p>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.38 }}
          style={{ marginBottom: '20px' }}
        >
          <Card
            header={
              <h2
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}
              >
                {t('about.techStackHeading')}
              </h2>
            }
            padding="16px"
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {techStack.map((tech, i) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: 0.42 + i * 0.04 }}
                >
                  <Badge variant={tech.variant} style={{ fontSize: '12px', padding: '4px 10px' }}>
                    {tech.name}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Build Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.45 }}
        >
          <Card
            header={
              <h2
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}
              >
                {t('about.buildInfoHeading')}
              </h2>
            }
            padding="16px"
          >
            <div>
              {buildInfo.map((item, i) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 0',
                    borderBottom:
                      i < buildInfo.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.label}</span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 500
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Footer credits */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.55 }}
          style={{
            textAlign: 'center',
            fontSize: '11px',
            color: 'var(--text-muted)',
            marginTop: '28px',
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: '1.6'
          }}
        >
          {t('about.footerCredits')}
          <br />
          {t('about.footerDevelopedBy')}
        </motion.p>
      </div>
    </motion.div>
  )
}
