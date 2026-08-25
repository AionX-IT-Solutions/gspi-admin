import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useAppStore } from '@/app/store/app.store'

export function useAppearanceSection() {
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const fontSize = useAppStore((s) => s.fontSize)
  const setFontSize = useAppStore((s) => s.setFontSize)
  const compactMode = useAppStore((s) => s.compactMode)
  const setCompactMode = useAppStore((s) => s.setCompactMode)

  const [draftFontSize, setDraftFontSize] = useState(fontSize)

  // Keep draft in sync if fontSize changes externally (e.g. reset)
  useEffect(() => {
    setDraftFontSize(fontSize)
  }, [fontSize])

  function handleToggleTheme() {
    toggleTheme()
    toast.success(`Switched to ${theme === 'dark' ? 'Light' : 'Dark'} mode`)
  }

  function handleFontSizeCommit(v: number[]) {
    setFontSize(v)
    toast.success(`Font size: ${v[0]}px`)
  }

  function handleCompactModeChange(v: boolean) {
    setCompactMode(v)
    toast.success(v ? 'Compact mode ON' : 'Compact mode OFF')
  }

  function handleLanguageChange(v: string) {
    setLanguage(v as 'en' | 'tl')
    toast.success('Language updated')
  }

  return {
    theme,
    language,
    draftFontSize,
    setDraftFontSize,
    compactMode,
    handleToggleTheme,
    handleFontSizeCommit,
    handleCompactModeChange,
    handleLanguageChange
  }
}
