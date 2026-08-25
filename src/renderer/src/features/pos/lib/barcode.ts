import JsBarcode from 'jsbarcode'

export function generateBarcodeDataUrl(value: string): string {
  const canvas = document.createElement('canvas')
  JsBarcode(canvas, value, {
    format: 'CODE128',
    displayValue: true,
    width: 2,
    height: 50,
    fontSize: 12,
    margin: 6
  })
  return canvas.toDataURL('image/png')
}

export function openLoyaltyCardPrintWindow(
  cards: { code: string; name: string; discountLabel: string }[]
) {
  const win = window.open('', '_blank', 'width=480,height=640')
  if (!win) return

  const cardHtml = cards
    .map((card) => {
      const dataUrl = generateBarcodeDataUrl(card.code)
      return `
        <div class="card">
          <div class="badge">Loyalty Member</div>
          <div class="name">${card.name}</div>
          <img src="${dataUrl}" />
          <div class="discount">${card.discountLabel}</div>
        </div>
      `
    })
    .join('')

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Loyalty Cards</title>
        <style>
          @page { size: auto; margin: 8mm; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
          .sheet { display: flex; flex-wrap: wrap; gap: 6mm; padding: 6mm; }
          .card {
            width: 85mm;
            height: 54mm;
            padding: 4mm;
            border: 1px dashed #999;
            border-radius: 3mm;
            text-align: center;
            page-break-inside: avoid;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .badge { font-size: 9px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: #666; margin-bottom: 2mm; }
          .name { font-size: 13px; font-weight: 700; margin-bottom: 2mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
          .discount { font-size: 11px; font-weight: 600; margin-top: 1mm; }
          img { max-width: 90%; }
        </style>
      </head>
      <body>
        <div class="sheet">${cardHtml}</div>
        <script>
          window.onload = () => { window.print(); }
        </script>
      </body>
    </html>
  `)
  win.document.close()
}

export function openBarcodeLabelPrintWindow(
  labels: { sku: string; name: string; price: string }[]
) {
  const win = window.open('', '_blank', 'width=480,height=640')
  if (!win) return

  const labelHtml = labels
    .map((label) => {
      const dataUrl = generateBarcodeDataUrl(label.sku)
      return `
        <div class="label">
          <div class="name">${label.name}</div>
          <img src="${dataUrl}" />
          <div class="price">${label.price}</div>
        </div>
      `
    })
    .join('')

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Barcode Labels</title>
        <style>
          @page { size: auto; margin: 8mm; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
          .sheet { display: flex; flex-wrap: wrap; gap: 6mm; padding: 6mm; }
          .label {
            width: 45mm;
            padding: 3mm;
            border: 1px dashed #999;
            text-align: center;
            page-break-inside: avoid;
          }
          .name { font-size: 10px; font-weight: 600; margin-bottom: 2mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .price { font-size: 12px; font-weight: 700; margin-top: 1mm; }
          img { max-width: 100%; }
        </style>
      </head>
      <body>
        <div class="sheet">${labelHtml}</div>
        <script>
          window.onload = () => { window.print(); }
        </script>
      </body>
    </html>
  `)
  win.document.close()
}
