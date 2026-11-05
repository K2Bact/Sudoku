import { useEffect, useRef } from 'react';
import { pushBackLayer } from '../utils/backLayers';

/**
 * While `open`, the Android back key closes this window before anything else
 * (utils/backLayers.js). The entry goes when `open` turns false or the window
 * unmounts. onClose is read when back is pressed, so a new function each render
 * does not move the window on the list.
 */
export function useBackLayer(open, onClose) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return undefined;
    return pushBackLayer(() => {
      if (closeRef.current) closeRef.current();
    });
  }, [open]);
}

export default useBackLayer;
