let cachedLogo: Promise<string | null> | null = null

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Fetches the GSPI/Girl Scouts logo once and caches it as a base64 data URL, for embedding
 * into exported reports (Excel via exceljs, PDF via jsPDF, Word via docx — all three accept
 * a data URL or raw base64 string for image data). Resolves to null if the logo can't be
 * loaded so a report never fails to export just because the logo is missing.
 */
export function getReportLogoDataUrl(): Promise<string | null> {
  if (!cachedLogo) {
    cachedLogo = fetch(`${import.meta.env.BASE_URL}logo.png`)
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => (blob ? blobToDataUrl(blob) : null))
      .catch(() => null)
  }
  return cachedLogo
}
