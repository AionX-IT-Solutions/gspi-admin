import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { BarcodeScannerSection } from '../components/BarcodeScannerSection'
import { BiometricDeviceSection } from '../components/BiometricDeviceSection'
import { ReceiptPrinterSection } from '../components/ReceiptPrinterSection'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function Devices() {
  const { t } = useTranslation()

  return (
    <motion.div
      key="devices"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <div style={{ marginBottom: '28px' }}>
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '4px'
          }}
        >
          {t('devices.title')}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('devices.subtitle')}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <BarcodeScannerSection />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
        >
          <BiometricDeviceSection />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.18 }}
        >
          <ReceiptPrinterSection />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Devices
