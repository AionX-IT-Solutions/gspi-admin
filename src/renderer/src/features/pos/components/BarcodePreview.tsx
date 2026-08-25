import { useBarcodeRef } from '../hooks/useBarcodeRef'

export function BarcodePreview({ value }: { value: string }) {
  const ref = useBarcodeRef(value)
  return <svg ref={ref} />
}
