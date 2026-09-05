import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Boxes,
  ImageOff,
  PackagePlus,
  Pencil,
  Plus,
  Printer,
  Trash2
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import {
  DataTable,
  useColumnVisibility,
  ColumnsButton,
  type Column
} from '@/shared/components/ui/DataTable'
import { TableToolbar } from '@/shared/components/ui/TableToolbar'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { currencyColumn, statusColumn, actionsColumn } from '@/shared/lib/columnHelpers'
import type { Product } from '../types/pos.types'
import { ProductFormModal } from '../components/ProductFormModal'
import { PrintLabelsModal } from '../components/PrintLabelsModal'
import { RestockModal } from '../components/RestockModal'
import { ProductReportsMenu } from '../components/ProductReportsMenu'
import { useProducts } from '../hooks/useProducts'
import { usePOSStore } from '../store/pos.store'
import { useCategoriesStore } from '../store/categories.store'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function Products() {
  const { t } = useTranslation()
  const {
    loading,
    toast,
    canManage,
    products,
    sales,
    purchases,
    lowStock,
    search,
    setSearch,
    filteredProducts,
    showForm,
    setShowForm,
    editTarget,
    openAdd,
    openEdit,
    form,
    setForm,
    handleSaveProduct,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    printTarget,
    setPrintTarget,
    printQty,
    setPrintQty,
    handlePrint,
    restockTarget,
    setRestockTarget,
    restockQty,
    setRestockQty,
    restockCost,
    setRestockCost,
    handleRestock
  } = useProducts()
  const hydrate = usePOSStore((s) => s.hydrate)
  const categories = useCategoriesStore((s) => s.categories)

  const columns: Column<Product>[] = [
    {
      key: 'imageUrl',
      header: t('products.table.image'),
      sortable: false,
      render: (r) => (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            overflow: 'hidden',
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {r.imageUrl ? (
            <img
              src={r.imageUrl}
              alt={r.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <ImageOff size={14} color="var(--text-muted)" strokeWidth={1.5} />
          )}
        </div>
      )
    },
    {
      key: 'sku',
      header: t('products.table.skuBarcode'),
      render: (r) => (
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{r.sku}</span>
      )
    },
    { key: 'name', header: t('products.table.product') },
    {
      key: 'categoryId',
      header: t('products.table.category'),
      sortable: false,
      render: (r) => <>{categories.find((c) => c.id === r.categoryId)?.name ?? '—'}</>
    },
    currencyColumn<Product>({ key: 'costPrice', header: t('products.table.cost') }),
    currencyColumn<Product>({ key: 'sellingPrice', header: t('products.table.price') }),
    {
      key: 'stockQuantity',
      header: t('products.table.stock'),
      align: 'right',
      render: (r) => (
        <span
          style={{
            color: r.stockQuantity <= r.reorderLevel ? '#f87171' : 'var(--c-text-1)',
            fontWeight: r.stockQuantity <= r.reorderLevel ? 700 : 400
          }}
        >
          {r.stockQuantity}
        </span>
      )
    },
    statusColumn<Product>({ key: 'isActive', header: t('products.table.status') }),
    actionsColumn<Product>(
      (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          {canManage && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<PackagePlus size={12} />}
              onClick={() => {
                setRestockTarget(r)
                setRestockQty(0)
                setRestockCost(r.costPrice)
              }}
            >
              {t('products.restockButton')}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Printer size={12} />}
            onClick={() => setPrintTarget(r)}
          >
            {t('products.printLabelButton')}
          </Button>
          {canManage && (
            <Button size="sm" variant="ghost" onClick={() => openEdit(r)} title={t('common.edit')}>
              <Pencil size={13} />
            </Button>
          )}
          {canManage && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteTarget(r)}
              title={t('common.delete')}
            >
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      ),
      t('common.actions')
    )
  ]

  const { hiddenColumns, toggleColumn } = useColumnVisibility(columns)

  return (
    <motion.div
      key="products"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('products.title')}
        icon={<Boxes size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            <ProductReportsMenu
              products={products}
              sales={sales}
              purchases={purchases}
              toast={toast}
            />
            {canManage && (
              <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={openAdd}>
                {t('products.addButton')}
              </Button>
            )}
          </>
        }
      />

      {lowStock.length > 0 && (
        <Card
          style={{ marginBottom: 14, borderColor: 'rgba(245,158,11,0.35)' }}
          padding="12px 16px"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: '#fbbf24'
            }}
          >
            <AlertTriangle size={14} />
            {t('products.lowStockAlert', {
              count: lowStock.length,
              names: lowStock.map((p) => p.name).join(', ')
            })}
          </div>
        </Card>
      )}

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('products.searchPlaceholder')}
        count={filteredProducts.length}
        columnsSlot={
          <ColumnsButton columns={columns} hiddenColumns={hiddenColumns} onToggle={toggleColumn} />
        }
      />

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={filteredProducts}
          hiddenColumns={hiddenColumns}
          loading={loading}
          emptyMessage={t('products.table.emptyMessage')}
        />
      </Card>

      <ProductFormModal
        open={showForm}
        onOpenChange={setShowForm}
        editTarget={editTarget}
        form={form}
        setForm={setForm}
        onSave={handleSaveProduct}
      />
      <PrintLabelsModal
        target={printTarget}
        onClose={() => setPrintTarget(null)}
        printQty={printQty}
        setPrintQty={setPrintQty}
        onPrint={handlePrint}
      />
      <RestockModal
        target={restockTarget}
        onClose={() => setRestockTarget(null)}
        restockQty={restockQty}
        setRestockQty={setRestockQty}
        restockCost={restockCost}
        setRestockCost={setRestockCost}
        onRestock={handleRestock}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('products.confirmDelete.title')}
        message={t('products.confirmDelete.message', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  )
}
