import { formatCurrency } from '@/shared/lib/utils'
import { getReportLogoDataUrl } from '@/shared/lib/reportLogo'
import { generateBarcodeDataUrl } from './barcode'
import type { Sale } from '../types/pos.types'
import type { SilentPrintResult } from '../../../../../shared/printing-types'

async function renderReceiptHtml(sale: Sale): Promise<string> {
  const logoDataUrl = await getReportLogoDataUrl()
  const barcodeDataUrl = generateBarcodeDataUrl(sale.saleNumber)

  const itemsHtml = sale.items
    .map(
      (item) => `
        <div class="item">
          <div class="item-name">${item.name}</div>
          <div class="item-row">
            <span>${item.quantity} x ${formatCurrency(item.unitPrice)}</span>
            <span>${formatCurrency(item.subtotal)}</span>
          </div>
        </div>
      `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt ${sale.saleNumber}</title>
        <style>
          @page { size: 80mm auto; margin: 3mm; }
          * { box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            width: 74mm;
            margin: 0 auto;
            font-size: 11px;
            color: #000;
            line-height: 1.45;
          }
          .center { text-align: center; }
          .logo { width: 44px; height: 44px; object-fit: contain; margin-bottom: 4px; }
          .org-name { font-size: 14px; font-weight: 700; letter-spacing: 0.2px; margin: 0; }
          .org-sub { font-size: 10px; margin: 1px 0; color: #222; }
          .badge {
            display: inline-block; margin-top: 6px; padding: 2px 10px;
            border: 1px solid #000; border-radius: 999px;
            font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
          }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .divider.solid { border-top: 1px solid #000; }
          .meta-row { display: flex; justify-content: space-between; gap: 8px; font-size: 10.5px; }
          .item { margin-bottom: 4px; }
          .item-name { font-weight: 600; }
          .item-row { display: flex; justify-content: space-between; color: #333; }
          .totals .line { display: flex; justify-content: space-between; font-size: 11px; margin: 2px 0; }
          .totals .grand { font-size: 14px; font-weight: 700; border-top: 1px solid #000; margin-top: 4px; padding-top: 4px; }
          .footer-note { font-size: 10px; margin-top: 4px; }
          .footer-note p { margin: 2px 0; }
          .barcode { width: 100%; max-width: 160px; margin: 8px auto 2px; display: block; }
        </style>
      </head>
      <body>
        <div class="center">
          ${logoDataUrl ? `<img class="logo" src="${logoDataUrl}" />` : ''}
          <p class="org-name">Girl Scouts of the Philippines</p>
          <p class="org-sub">Ilocos Sur Council</p>
          <p class="org-sub">Plaza Burgos, Vigan City, Ilocos Sur</p>
          <span class="badge">Official Receipt</span>
        </div>

        <div class="divider"></div>

        <div class="meta-row"><span>Receipt #</span><span>${sale.saleNumber}</span></div>
        <div class="meta-row"><span>Date</span><span>${new Date(sale.createdAt).toLocaleString('en-PH')}</span></div>
        <div class="meta-row"><span>Cashier</span><span>${sale.cashierName}</span></div>
        ${sale.memberName ? `<div class="meta-row"><span>Member</span><span>${sale.memberName}</span></div>` : ''}

        <div class="divider"></div>

        ${itemsHtml}

        <div class="divider"></div>

        <div class="totals">
          <div class="line"><span>Subtotal</span><span>${formatCurrency(sale.subtotal)}</span></div>
          ${sale.discountAmount > 0 ? `<div class="line"><span>Discount</span><span>-${formatCurrency(sale.discountAmount)}</span></div>` : ''}
          <div class="line grand"><span>TOTAL</span><span>${formatCurrency(sale.totalAmount)}</span></div>
          <div class="line"><span>Payment</span><span>${sale.paymentMethod.toUpperCase()}</span></div>
        </div>

        <div class="divider solid"></div>

        <div class="center footer-note">
          <p>Thank you for supporting</p>
          <p><strong>GSP Ilocos Sur Council!</strong></p>
          <img class="barcode" src="${barcodeDataUrl}" />
        </div>
      </body>
    </html>
  `
}

/** Prints straight to the configured receipt printer with no OS dialog — see PrinterService for how the cash drawer piggybacks on this. */
export async function silentPrintReceipt(
  sale: Sale,
  deviceName?: string | null
): Promise<SilentPrintResult> {
  if (!window.api?.printer) return { ok: false, error: 'Printer bridge unavailable' }
  const html = await renderReceiptHtml(sale)
  return window.api.printer.silentPrint({ html, deviceName })
}
