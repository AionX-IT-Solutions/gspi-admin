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
 * Fetches the GSP ribbon mark once and caches it as a base64 data URL, for embedding
 * into exported reports (Excel via exceljs, PDF via jsPDF, Word via docx — all three accept
 * a data URL or raw base64 string for image data). Resolves to null if the logo can't be
 * loaded so a report never fails to export just because the logo is missing.
 *
 * This is a plain trefoil crop (no ring text, no council wordmark baked in) — official GSP
 * paper forms print it that way, with the org/region/council name typed out separately
 * beneath it. The full circular seal (logo.png) is used elsewhere in the app (sidebar,
 * about page, login) but would duplicate that text on a report header, so exports use this
 * separate crop instead.
 */
export function getReportLogoDataUrl(): Promise<string | null> {
  if (!cachedLogo) {
    cachedLogo = fetch(`${import.meta.env.BASE_URL}logo-mark.png`)
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => (blob ? blobToDataUrl(blob) : null))
      .catch(() => null)
  }
  return cachedLogo
}
