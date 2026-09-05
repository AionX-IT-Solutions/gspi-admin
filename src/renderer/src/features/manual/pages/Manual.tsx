import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { BookOpen, Search, Lightbulb, Compass } from 'lucide-react'
import { Card } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { Input } from '@/shared/components/ui/Input'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { usePermissionsStore } from '@/app/store/permissions.store'
import { MODULE_PERMISSIONS, USER_ROLES } from '@/app/lib/permissions'
import { manualSections, type ManualModule } from '../data/manualContent'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

function moduleAnchor(key: string) {
  return `manual-${key}`
}

function scrollToAnchor(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function AccessBadges({ moduleKey }: { moduleKey: string }) {
  const { t } = useTranslation()
  const rolePermissions = usePermissionsStore((s) => s.rolePermissions)
  const customRoles = usePermissionsStore((s) => s.customRoles)
  const permission = MODULE_PERMISSIONS[moduleKey]

  if (!permission) {
    return <Badge variant="cyan">{t('manual.everyone')}</Badge>
  }

  const roles = USER_ROLES.filter((role) => (rolePermissions[role] ?? []).includes(permission))
  const customCount = customRoles.filter((role) =>
    (rolePermissions[role.id] ?? []).includes(permission)
  ).length

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {roles.map((role) => (
        <Badge key={role} variant="primary">
          {t(`roles.${role}`)}
        </Badge>
      ))}
      {customCount > 0 && (
        <Badge variant="default">
          +{customCount} {t('manual.customRoles')}
        </Badge>
      )}
    </div>
  )
}

function ModuleCard({ module }: { module: ManualModule }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'tl' ? 'tl' : 'en'

  return (
    <div id={moduleAnchor(module.key)} style={{ scrollMarginTop: 16 }}>
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                borderRadius: 8,
                background: 'var(--accent-primary-subtle)',
                color: 'var(--accent-primary)',
                flexShrink: 0
              }}
            >
              {module.icon}
            </span>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              {t(`sidebar.nav.${module.key}`)}
            </h3>
          </div>
        }
        padding="16px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            {module.summary[lang]}
          </p>

          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                marginBottom: 8
              }}
            >
              {t('manual.stepsHeading')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {module.steps[lang].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span
                    style={{
                      flexShrink: 0,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-muted)',
                      fontSize: 10,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 1
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {module.tips && (
            <div
              style={{
                display: 'flex',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 10,
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.2)'
              }}
            >
              <Lightbulb size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {module.tips[lang].map((tip, i) => (
                  <span
                    key={i}
                    style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}
                  >
                    {tip}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                marginBottom: 8
              }}
            >
              {t('manual.rolesHeading')}
            </p>
            <AccessBadges moduleKey={module.key} />
          </div>
        </div>
      </Card>
    </div>
  )
}

export function Manual() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'tl' ? 'tl' : 'en'
  const [search, setSearch] = useState('')

  const query = search.trim().toLowerCase()

  const filteredSections = useMemo(() => {
    if (!query) return manualSections
    return manualSections
      .map((section) => ({
        ...section,
        modules: section.modules.filter((module) => {
          const title = t(`sidebar.nav.${module.key}`).toLowerCase()
          const haystack = [title, module.summary[lang], ...module.steps[lang]]
            .join(' ')
            .toLowerCase()
          return haystack.includes(query)
        })
      }))
      .filter((section) => section.modules.length > 0)
  }, [query, lang, t])

  const hasResults = filteredSections.length > 0

  return (
    <motion.div
      key="manual"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('manual.title')}
        subtitle={t('manual.subtitle')}
        icon={<BookOpen size={18} />}
      />

      <div style={{ marginBottom: 20, maxWidth: 420 }}>
        <Input
          leftIcon={<Search size={14} />}
          placeholder={t('manual.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div
        style={{
          display: 'flex',
          gap: 24,
          alignItems: 'flex-start'
        }}
      >
        {/* Table of contents */}
        <div
          style={{
            width: 220,
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          <Card padding="10px">
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                padding: '4px 8px 8px'
              }}
            >
              {t('manual.tocHeading')}
            </p>
            <button
              onClick={() => scrollToAnchor('manual-intro')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '6px 8px',
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Compass size={13} />
              {t('manual.intro.title')}
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
              {filteredSections.map((section) => (
                <div key={section.key}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '4px 8px',
                      color: 'var(--text-muted)',
                      fontSize: 10.5,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {section.icon}
                    {t(`manual.groups.${section.key}`)}
                  </div>
                  {section.modules.map((module) => (
                    <button
                      key={module.key}
                      onClick={() => scrollToAnchor(moduleAnchor(module.key))}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '5px 8px 5px 26px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        fontSize: 12,
                        cursor: 'pointer',
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--sidebar-nav-hover)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      {t(`sidebar.nav.${module.key}`)}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div id="manual-intro" style={{ scrollMarginTop: 16 }}>
            <Card
              header={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Compass size={16} color="var(--accent-primary)" />
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {t('manual.intro.title')}
                  </h2>
                </div>
              }
              padding="16px"
            >
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: 10
                }}
              >
                {t('manual.intro.body')}
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 18 }}>
                {(t('manual.intro.points', { returnObjects: true }) as string[]).map((point, i) => (
                  <li
                    key={i}
                    style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {!hasResults && (
            <Card padding="24px">
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                {t('manual.noResults')}
              </p>
            </Card>
          )}

          {filteredSections.map((section) => (
            <div key={section.key} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{section.icon}</span>
                <h2
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-muted)'
                  }}
                >
                  {t(`manual.groups.${section.key}`)}
                </h2>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 14
                }}
              >
                {section.modules.map((module) => (
                  <ModuleCard key={module.key} module={module} />
                ))}
              </div>
            </div>
          ))}

          <p
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              textAlign: 'center',
              marginTop: 8
            }}
          >
            {t('manual.rolesFootnote')}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
