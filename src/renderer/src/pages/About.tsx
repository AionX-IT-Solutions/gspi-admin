import { motion } from 'framer-motion'
import { Github, BookOpen, ExternalLink } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { useElectron } from '../hooks/useElectron'

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

const buildInfo = [
  { label: 'Build Tool', value: 'electron-vite' },
  { label: 'Node Target', value: 'ES2022' },
  { label: 'Renderer Target', value: 'Chromium 130+' },
  { label: 'Architecture', value: 'x64 / arm64' },
  { label: 'License', value: 'MIT' }
]

export function About() {
  const { appVersion, openExternal } = useElectron()

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
              maxWidth: '400px',
              margin: '0 auto 24px'
            }}
          >
            Futuristic Electron Vite Boilerplate — production-ready, blazing fast, beautifully
            crafted.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.34 }}
            style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Button
              variant="primary"
              size="md"
              leftIcon={<Github size={16} />}
              rightIcon={<ExternalLink size={13} />}
              onClick={() => openExternal('https://github.com')}
            >
              GitHub
            </Button>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<BookOpen size={16} />}
              rightIcon={<ExternalLink size={13} />}
              onClick={() => openExternal('https://electron-vite.org')}
            >
              Documentation
            </Button>
          </motion.div>
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
                Tech Stack
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
                Build Information
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
          Built with electron-vite · React 19 · TypeScript · Tailwind CSS
          <br />
          Made with precision for developers who care about craft.
        </motion.p>
      </div>
    </motion.div>
  )
}
