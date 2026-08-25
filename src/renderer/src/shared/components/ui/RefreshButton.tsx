import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'

interface RefreshButtonProps {
  onRefresh: () => Promise<void> | void
}

/** A small, consistent "Refresh" action for module page headers — re-fetches that page's data
 *  from Firestore, bypassing the store's one-time-hydration guard. */
export function RefreshButton({ onRefresh }: RefreshButtonProps) {
  const { t } = useTranslation()
  const [refreshing, setRefreshing] = useState(false)

  async function handleClick() {
    if (refreshing) return
    setRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleClick}
      disabled={refreshing}
      leftIcon={
        <RefreshCw
          size={13}
          style={refreshing ? { animation: 'spin 0.8s linear infinite' } : undefined}
        />
      }
    >
      {t('common.refresh')}
    </Button>
  )
}
