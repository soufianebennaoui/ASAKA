// ═══════════════════════════════════════════════════════════
//  useDragDismiss  — smooth swipe-down-to-close for bottom sheets
//
//  Usage:
//    const { panelRef, dragHandleProps, panelDragProps } = useDragDismiss(onClose);
//    // ref={panelRef}           → the sheet panel div
//    // {...dragHandleProps}     → the handle-bar div
//    // {...panelDragProps}      → the panel wrapper (initiates from top zone only)
// ═══════════════════════════════════════════════════════════
import { useRef, useCallback } from 'react';

export function useDragDismiss(onClose, threshold = 80) {
  const panelRef   = useRef(null);

  // Drag state — all in refs so no re-renders during gesture
  const startY     = useRef(null);
  const deltaY     = useRef(0);
  const dragging   = useRef(false);
  const rafId      = useRef(null);

  // Velocity tracking: ring buffer of { t, y } samples
  const samples    = useRef([]);

  // ── Helpers ─────────────────────────────────────────────
  const getVelocity = () => {
    const s = samples.current;
    if (s.length < 2) return 0;
    const newest = s[s.length - 1];
    // look back up to 80 ms for a stable reference point
    let oldest = s[0];
    for (let i = s.length - 2; i >= 0; i--) {
      if (newest.t - s[i].t <= 80) { oldest = s[i]; }
      else break;
    }
    const dt = newest.t - oldest.t;
    if (dt === 0) return 0;
    return (newest.y - oldest.y) / dt; // px per ms
  };

  const applyTransform = useCallback((d) => {
    if (!panelRef.current) return;
    // Rubber-band: slow down drag above threshold so it feels weighty
    const clamped  = d < 0 ? 0 : d;
    const eased    = clamped < threshold
      ? clamped
      : threshold + (clamped - threshold) * 0.35;

    // Subtle opacity + scale bleed-off as you pull down
    const progress  = Math.min(1, eased / 260);
    const opacity   = 1 - progress * 0.25;
    const scaleY    = 1 - progress * 0.015;

    panelRef.current.style.transform = `translateY(${eased}px) scaleY(${scaleY})`;
    panelRef.current.style.opacity   = opacity;
  }, [threshold]);

  // ── Gesture lifecycle ────────────────────────────────────
  const begin = useCallback((clientY) => {
    startY.current   = clientY;
    deltaY.current   = 0;
    dragging.current = true;
    samples.current  = [{ t: performance.now(), y: clientY }];

    if (panelRef.current) {
      panelRef.current.style.transition      = 'none';
      panelRef.current.style.willChange      = 'transform, opacity';
      panelRef.current.style.transformOrigin = 'center bottom';
    }
  }, []);

  const move = useCallback((clientY) => {
    if (!dragging.current || startY.current === null) return;

    const d = clientY - startY.current;
    deltaY.current = d;

    // Record velocity sample (keep last 10)
    samples.current.push({ t: performance.now(), y: clientY });
    if (samples.current.length > 10) samples.current.shift();

    // Schedule RAF update — never queue more than one
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      applyTransform(deltaY.current);
    });
  }, [applyTransform]);

  const end = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;

    // Cancel any pending RAF
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    const velocity = getVelocity(); // px/ms  (positive = downward)
    const d        = deltaY.current;

    // Dismiss if: dragged past threshold OR fast flick (>0.4 px/ms)
    const shouldDismiss = d > threshold || (d > 30 && velocity > 0.4);

    if (shouldDismiss) {
      // Duration scales inversely with velocity — faster flick = snappier exit
      const speed    = Math.max(velocity, 0.3);          // px/ms
      const duration = Math.round(Math.min(280, Math.max(120, 120 / speed)));

      if (panelRef.current) {
        panelRef.current.style.transition = `transform ${duration}ms cubic-bezier(0.4,0,1,1), opacity ${duration}ms ease-out`;
        panelRef.current.style.transform  = 'translateY(110%) scaleY(1)';
        panelRef.current.style.opacity    = '0';
      }
      setTimeout(() => {
        onClose();
        // Reset styles in case component stays mounted
        if (panelRef.current) {
          panelRef.current.style.transform  = '';
          panelRef.current.style.opacity    = '';
          panelRef.current.style.willChange = '';
        }
      }, duration - 10);
    } else {
      // Snap back with bouncy spring feel
      if (panelRef.current) {
        panelRef.current.style.transition =
          'transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease-out';
        panelRef.current.style.transform  = 'translateY(0px) scaleY(1)';
        panelRef.current.style.opacity    = '1';
      }
      setTimeout(() => {
        if (panelRef.current) {
          panelRef.current.style.willChange = '';
        }
      }, 400);
    }

    startY.current  = null;
    deltaY.current  = 0;
    samples.current = [];
  }, [onClose, threshold]);

  // ── Prop bundles ─────────────────────────────────────────
  // Spread onto the handle bar (full capture)
  const dragHandleProps = {
    onTouchStart : (e) => begin(e.touches[0].clientY),
    onTouchMove  : (e) => { e.preventDefault(); move(e.touches[0].clientY); },
    onTouchEnd   : end,
    onTouchCancel: end,
    style        : { touchAction: 'none', cursor: 'grab', userSelect: 'none' },
  };

  // Spread onto the panel div (only from top ~56 px zone)
  const panelDragProps = {
    onTouchStart: (e) => {
      const rect = panelRef.current?.getBoundingClientRect();
      if (!rect) return;
      const relY = e.touches[0].clientY - rect.top;
      if (relY < 56) begin(e.touches[0].clientY);
    },
    onTouchMove  : (e) => move(e.touches[0].clientY),
    onTouchEnd   : end,
    onTouchCancel: end,
  };

  return { panelRef, dragHandleProps, panelDragProps };
}
