import { PDFDocument } from 'pdf-lib'

export async function compressImageFile(
  file: File,
  maxWidth = 1600,
  quality = 0.75
): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  try {
    const imgBitmap = await createImageBitmap(file)
    const ratio = Math.min(1, maxWidth / imgBitmap.width)
    const width = Math.round(imgBitmap.width * ratio)
    const height = Math.round(imgBitmap.height * ratio)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(imgBitmap, 0, 0, width, height)
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    )
    if (!blob) return file
    const newName = `${file.name.replace(/\.[^.]+$/, '')}.jpg`
    return new File([blob], newName, { type: 'image/jpeg' })
  } catch (err) {
    console.warn('compressImageFile failed, returning original file', err)
    return file
  }
}

export async function compressPdf(file: File): Promise<File> {
  if (!file.type.includes('pdf')) return file
  try {
    const buf = await file.arrayBuffer()
    const src = await PDFDocument.load(buf)
    const dst = await PDFDocument.create()
    const pages = await dst.copyPages(src, src.getPageIndices())
    pages.forEach((p) => dst.addPage(p))
    const pdfBytes = await dst.save({ useObjectStreams: false })
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
    return new File([blob], file.name, { type: 'application/pdf' })
  } catch (err) {
    console.warn('compressPdf failed, returning original file', err)
    return file
  }
}

export async function compressFile(file: File): Promise<File> {
  if (!file) return file
  // Images: resize + recompress to JPEG
  if (file.type.startsWith('image/')) return compressImageFile(file)
  // PDFs: attempt to re-save which may strip metadata and reduce size
  if (file.type.includes('pdf')) return compressPdf(file)
  return file
}
