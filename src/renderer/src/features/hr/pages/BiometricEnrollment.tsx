import { motion } from 'framer-motion'
import { ArrowLeft, Fingerprint } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/Button'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { EnrollmentTab } from '../components/EnrollmentTab'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function BiometricEnrollment() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <motion.div
      key="biometric-enrollment"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('biometricKiosk.title')}
        subtitle={t('biometricKiosk.subtitle')}
        icon={<Fingerprint size={18} />}
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft size={13} />}
            onClick={() => navigate('/attendance')}
          >
            {t('biometricKiosk.backButton')}
          </Button>
        }
      />

      <EnrollmentTab />
    </motion.div>
  )
}
