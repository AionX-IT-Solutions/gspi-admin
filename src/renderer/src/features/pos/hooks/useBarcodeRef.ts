import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

export function useBarcodeRef(value: string) {
  const ref = useRef<SVGSVGElement>(null)
  useEffect(() => {
    if (ref.current) {
      JsBarcode(ref.current, value, {
        format: 'CODE128',
        width: 1.6,
        height: 40,
        fontSize: 11,
        margin: 4
      })
    }
  }, [value])
  return ref
}
