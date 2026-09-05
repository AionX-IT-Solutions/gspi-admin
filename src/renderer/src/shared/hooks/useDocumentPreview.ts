import { useCallback, useState } from 'react'
import type { jsPDF } from 'jspdf'
import { previewPdf } from '../lib/pdfExport'

/** Shared glue behind every export's "View" button — builds a blob URL from a jsPDF
 *  doc (see pdfExport.ts's previewPdf) and hands it to DocumentPreviewModal, revoking
 *  it on close so repeated previews don't leak memory. */
export function useDocumentPreview() {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState<string | null>(null)

  const openPreview = useCallback((doc: jsPDF) => {
    setUrl(previewPdf(doc))
    setOpen(true)
  }, [])

  const closePreview = useCallback(() => {
    setOpen(false)
    setUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return null
    })
  }, [])

  return { open, url, openPreview, closePreview }
}
