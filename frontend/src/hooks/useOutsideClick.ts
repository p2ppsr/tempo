/**
 * @file useOutsideClick.ts
 * @description
 * Custom React hook that detects when a user clicks outside a referenced element,
 * and triggers a callback function. Useful for modals, dropdowns, popovers, etc.
 */


import { useEffect } from 'react'
import type { RefObject } from 'react'

/**
 * useOutsideClick Hook
 *
 * Attaches a `mousedown` event listener to the document that checks if a click
 * occurred outside the element referenced by `ref`. If so, the provided `callback`
 * is called.
 *
 * @param ref - Ref object pointing to the DOM element to detect outside clicks for.
 * @param callback - Function to call when an outside click is detected.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * useOutsideClick(ref, () => setOpen(false));
 *
 * return <div ref={ref}>Content</div>;
 */
export default function useOutsideClick<T extends HTMLElement>(
  ref: RefObject<T | null>,
  callback: () => void
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, callback])
}
