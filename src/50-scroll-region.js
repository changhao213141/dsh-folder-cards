/**
 * Scroll region with the shell's wheel hand-off binding and the hover-revealed thumb.
 *
 * This file is a fragment of the single client bundle. build.mjs concatenates
 * the sections in name order inside the factory closure, so declarations are
 * shared across files and no import statements are needed.
 */
    /* ---------- scroll region ---------- */

    /**
     * A vertical scroll area that owns its wheel handling (the sidebar's own
     * viewport otherwise swallows the gesture) and draws a slim draggable
     * thumb beside the content.
     * @param props - `label` names the slider, `className` styles the content box, children are the content.
     */
    function ScrollRegion(props) {
      const scrollRef = useRef(null);
      const dragRef = useRef(null);
      const [dragging, setDragging] = useState(false);
      const [metrics, setMetrics] = useState({ visible: false, ratio: 1, offset: 0, viewport: 0 });

      const measure = useCallback(() => {
        const element = scrollRef.current;
        if (!element) return;
        const viewport = element.clientHeight;
        const content = element.scrollHeight;
        const max = content - viewport;
        const ratio = content > 0 ? Math.min(1, viewport / content) : 1;
        const offset = max > 0 ? Math.min(1, Math.max(0, element.scrollTop / max)) : 0;
        setMetrics(previous => {
          const visible = max > 1 && viewport > 0;
          if (previous.visible === visible && previous.viewport === viewport
            && Math.abs(previous.ratio - ratio) < 0.002
            && Math.abs(previous.offset - offset) < 0.002) return previous;
          return { visible, ratio, offset, viewport };
        });
      }, []);

      /* Content and viewport both change between renders; the observer covers
         resizing, the render pass covers new rows. */
      useEffect(() => { measure(); });
      useEffect(() => {
        const element = scrollRef.current;
        if (!element) return undefined;
        const onScroll = () => measure();
        element.addEventListener('scroll', onScroll, { passive: true });
        const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(() => measure()) : null;
        if (observer) observer.observe(element);
        return () => {
          element.removeEventListener('scroll', onScroll);
          if (observer) observer.disconnect();
        };
      }, [measure]);

      /* The shell hands wheel gestures between the sidebar viewport (which
         scrolls the navigation away first) and this inner scroller; binding
         the scroller is what lets the gesture continue past the inner end. */
      const setScrollerRef = useCallback(element => {
        scrollRef.current = element;
        if (typeof props.bindScroller === 'function') props.bindScroller(element);
      }, [props.bindScroller]);

      const scrollToOffset = useCallback(offset => {
        const element = scrollRef.current;
        if (!element) return;
        const max = element.scrollHeight - element.clientHeight;
        element.scrollTop = Math.min(max, Math.max(0, offset * max));
      }, []);

      const onThumbPointerDown = useCallback(event => {
        const element = scrollRef.current;
        const thumb = event.currentTarget;
        if (!element || !thumb) return;
        event.preventDefault();
        event.stopPropagation();
        try { thumb.setPointerCapture(event.pointerId); } catch (error) { /* capture is best effort */ }
        const track = thumb.parentElement;
        setDragging(true);
        dragRef.current = {
          startY: event.clientY,
          startTop: element.scrollTop,
          max: element.scrollHeight - element.clientHeight,
          track: track ? track.clientHeight : 0,
          thumb: thumb.clientHeight,
        };
      }, []);

      const onThumbPointerMove = useCallback(event => {
        const drag = dragRef.current;
        const element = scrollRef.current;
        if (!drag || !element) return;
        event.preventDefault();
        const travel = Math.max(1, drag.track - drag.thumb);
        element.scrollTop = drag.startTop + (event.clientY - drag.startY) * (drag.max / travel);
      }, []);

      const endDrag = useCallback(event => {
        if (!dragRef.current) return;
        dragRef.current = null;
        setDragging(false);
        const thumb = event && event.currentTarget;
        if (thumb && typeof thumb.releasePointerCapture === 'function' && event.pointerId !== undefined) {
          try { thumb.releasePointerCapture(event.pointerId); } catch (error) { /* already released */ }
        }
      }, []);

      const onTrackPointerDown = useCallback(event => {
        if (event.target !== event.currentTarget) return;
        const track = event.currentTarget;
        const rect = track.getBoundingClientRect();
        if (rect.height <= 0) return;
        event.preventDefault();
        scrollToOffset((event.clientY - rect.top) / rect.height);
      }, [scrollToOffset]);

      const onThumbKeyDown = useCallback(event => {
        const element = scrollRef.current;
        if (!element) return;
        const page = Math.max(32, Math.round(element.clientHeight * 0.85));
        const step = 28;
        let next = null;
        if (event.key === 'ArrowDown') next = element.scrollTop + step;
        else if (event.key === 'ArrowUp') next = element.scrollTop - step;
        else if (event.key === 'PageDown') next = element.scrollTop + page;
        else if (event.key === 'PageUp') next = element.scrollTop - page;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = element.scrollHeight;
        if (next === null) return;
        event.preventDefault();
        element.scrollTop = next;
      }, []);

      const trackHeight = Math.max(0, metrics.viewport - 4);
      const thumbHeight = Math.max(18, Math.min(trackHeight, Math.round(metrics.ratio * trackHeight)));
      const thumbTop = Math.max(0, Math.round(metrics.offset * Math.max(0, trackHeight - thumbHeight)));

      return h('div', { className: 'dsh-fc-scrollRegion' },
        h('div', {
          className: 'dsh-fc-scroller' + (props.className ? ' ' + props.className : ''),
          ref: setScrollerRef,
        }, props.children),
        metrics.visible
          ? h('div', { className: 'dsh-fc-track', onPointerDown: onTrackPointerDown },
              h('div', {
                className: 'dsh-fc-thumb' + (dragging ? ' is-dragging' : ''),
                role: 'slider',
                tabIndex: 0,
                'aria-orientation': 'vertical',
                'aria-label': props.label || 'scroll',
                'aria-valuemin': 0,
                'aria-valuemax': 100,
                'aria-valuenow': Math.round(metrics.offset * 100),
                style: { top: thumbTop + 'px', height: thumbHeight + 'px' },
                onPointerDown: onThumbPointerDown,
                onPointerMove: onThumbPointerMove,
                onPointerUp: endDrag,
                onPointerCancel: endDrag,
                onKeyDown: onThumbKeyDown,
              }))
          : null,
      );
    }

