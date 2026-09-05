import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/Tabs'
import { IncomeStatementTab } from '../components/IncomeStatementTab'
import { BalanceSheetTab } from '../components/BalanceSheetTab'
import { DailyCollectionsTab } from '../components/DailyCollectionsTab'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function Reports() {
  const { t } = useTranslation()
  const periodLabel = new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })

  return (
    <motion.div
      key="reports"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader title={t('reports.title')} icon={<BarChart3 size={18} />} />

      <Tabs defaultValue="pnl">
        <div style={{ marginBottom: 20 }}>
          <TabsList>
            <TabsTrigger value="pnl">{t('reports.tabs.pnl')}</TabsTrigger>
            <TabsTrigger value="balance-sheet">{t('reports.tabs.balanceSheet')}</TabsTrigger>
            <TabsTrigger value="daily-collections">
              {t('reports.tabs.dailyCollections')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pnl">
          <IncomeStatementTab periodLabel={periodLabel} />
        </TabsContent>

        <TabsContent value="balance-sheet">
          <BalanceSheetTab periodLabel={periodLabel} />
        </TabsContent>

        <TabsContent value="daily-collections">
          <DailyCollectionsTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
