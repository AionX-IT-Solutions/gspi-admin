import * as Select from '@radix-ui/react-select'
import { Palette, ChevronDown, Check, Sun, Moon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Tooltip } from '@/shared/components/ui/Tooltip'
import { SettingRow, SectionHeader, StyledSwitch, StyledSlider } from './primitives'
import { AccentPicker } from './AccentPicker'
import { useAppearanceSection } from '../hooks/useAppearanceSection'

export function AppearanceSection() {
  const { t } = useTranslation()
  const {
    theme,
    language,
    draftFontSize,
    setDraftFontSize,
    compactMode,
    handleToggleTheme,
    handleFontSizeCommit,
    handleCompactModeChange,
    handleLanguageChange
  } = useAppearanceSection()

  return (
    <Card
      header={
        <SectionHeader
          icon={<Palette size={18} />}
          title={t('settings.appearance')}
          description={t('settings.appearanceDesc')}
        />
      }
      padding="20px"
    >
      <div>
        <SettingRow label={t('settings.darkMode')} description={t('settings.darkModeDesc')}>
          <Tooltip
            content={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            side="top"
          >
            <button
              onClick={handleToggleTheme}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '5px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-default)',
                background: theme === 'dark' ? 'rgba(99,102,241,0.1)' : 'rgba(251,191,36,0.1)',
                color: theme === 'dark' ? 'var(--accent-primary)' : '#f59e0b',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
            >
              {theme === 'dark' ? (
                <>
                  <Moon size={13} />
                  {t('settings.dark')}
                </>
              ) : (
                <>
                  <Sun size={13} />
                  {t('settings.light')}
                </>
              )}
            </button>
          </Tooltip>
        </SettingRow>

        <SettingRow label={t('settings.accentColor')} description={t('settings.accentColorDesc')}>
          <AccentPicker />
        </SettingRow>

        <SettingRow label={t('settings.fontSize')} description={t('settings.fontSizeDesc')}>
          <StyledSlider
            value={draftFontSize}
            onValueChange={setDraftFontSize}
            onValueCommit={handleFontSizeCommit}
            min={10}
            max={20}
            step={1}
          />
        </SettingRow>

        <SettingRow
          label={t('settings.compactMode')}
          description={t('settings.compactModeDesc')}
          badge={t('common.beta')}
        >
          <StyledSwitch checked={compactMode} onCheckedChange={handleCompactModeChange} />
        </SettingRow>

        <SettingRow label={t('settings.language')}>
          <Select.Root value={language} onValueChange={handleLanguageChange}>
            <Select.Trigger
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '12px',
                cursor: 'pointer',
                outline: 'none',
                minWidth: '130px',
                justifyContent: 'space-between'
              }}
            >
              <Select.Value />
              <Select.Icon>
                <ChevronDown size={13} />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                style={{
                  background: 'var(--popover-bg)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid var(--popover-border)',
                  borderRadius: '10px',
                  padding: '4px',
                  boxShadow: 'var(--popover-shadow)',
                  zIndex: 9999
                }}
                position="popper"
                sideOffset={4}
              >
                <Select.Viewport>
                  {[
                    { value: 'en', label: 'English' },
                    { value: 'tl', label: 'Tagalog' }
                  ].map((opt) => (
                    <Select.Item
                      key={opt.value}
                      value={opt.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        outline: 'none',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--popover-item-hover)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <Select.ItemText>{opt.label}</Select.ItemText>
                      <Select.ItemIndicator>
                        <Check size={12} color="var(--accent-primary)" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </SettingRow>
      </div>
    </Card>
  )
}
