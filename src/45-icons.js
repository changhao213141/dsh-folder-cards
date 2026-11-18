/**
 * Inline SVG glyphs; they inherit currentColor so the host theme colors them.
 *
 * This file is a fragment of the single client bundle. build.mjs concatenates
 * the sections in name order inside the factory closure, so declarations are
 * shared across files and no import statements are needed.
 */
    /* ---------- glyphs ---------- */

    function folderGlyph() {
      return h('svg', { viewBox: '0 0 48 48', 'aria-hidden': true, focusable: false },
        h('path', {
          d: 'M5.5 13.5a3 3 0 0 1 3-3h9.6c.8 0 1.57.32 2.14.88l2.9 2.9h14.36a3 3 0 0 1 3 3V19h-35v-5.5Z',
          fill: 'currentColor',
          opacity: 0.35,
        }),
        h('path', {
          d: 'M5.5 19h37v16.5a3 3 0 0 1-3 3h-31a3 3 0 0 1-3-3V19Z',
          fill: 'currentColor',
          opacity: 0.75,
        }),
      );
    }

    function iconPlus() {
      return h('svg', { viewBox: '0 0 16 16', width: 14, height: 14, 'aria-hidden': true, focusable: false },
        h('path', { d: 'M8 3v10M3 8h10', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }),
      );
    }

    function iconChevronLeft() {
      return h('svg', { viewBox: '0 0 16 16', width: 14, height: 14, 'aria-hidden': true, focusable: false },
        h('path', { d: 'M10 3.5 5.5 8l4.5 4.5', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }),
      );
    }

    function iconImage() {
      return h('svg', { viewBox: '0 0 16 16', width: 12, height: 12, 'aria-hidden': true, focusable: false },
        h('rect', { x: 2.25, y: 3.25, width: 11.5, height: 9.5, rx: 1.6, stroke: 'currentColor', strokeWidth: 1.2, fill: 'none' }),
        h('circle', { cx: 5.8, cy: 6.6, r: 1.05, fill: 'currentColor' }),
        h('path', { d: 'M3.6 11.6 6.9 8.6l2.1 1.9 1.6-1.4 2 2.1', stroke: 'currentColor', strokeWidth: 1.2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }),
      );
    }

    function iconReset() {
      return h('svg', { viewBox: '0 0 16 16', width: 12, height: 12, 'aria-hidden': true, focusable: false },
        h('path', { d: 'M4 4.6A5 5 0 1 1 3.4 9', stroke: 'currentColor', strokeWidth: 1.3, fill: 'none', strokeLinecap: 'round' }),
        h('path', { d: 'M4.1 1.8v3h3', stroke: 'currentColor', strokeWidth: 1.3, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }),
      );
    }

    function iconSearch() {
      return h('svg', { viewBox: '0 0 16 16', width: 14, height: 14, 'aria-hidden': true, focusable: false },
        h('circle', { cx: 7, cy: 7, r: 4.2, stroke: 'currentColor', strokeWidth: 1.4, fill: 'none' }),
        h('path', { d: 'M10.3 10.3 14 14', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' }),
      );
    }

    function iconClose() {
      return h('svg', { viewBox: '0 0 16 16', width: 12, height: 12, 'aria-hidden': true, focusable: false },
        h('path', { d: 'M4 4l8 8M12 4l-8 8', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' }),
      );
    }

    function iconMore() {
      return h('svg', { viewBox: '0 0 16 16', width: 12, height: 12, 'aria-hidden': true, focusable: false },
        h('circle', { cx: 3.5, cy: 8, r: 1.05, fill: 'currentColor' }),
        h('circle', { cx: 8, cy: 8, r: 1.05, fill: 'currentColor' }),
        h('circle', { cx: 12.5, cy: 8, r: 1.05, fill: 'currentColor' }),
      );
    }

    function iconSliders() {
      return h('svg', { viewBox: '0 0 16 16', width: 14, height: 14, 'aria-hidden': true, focusable: false },
        h('path', { d: 'M2.5 5h11M2.5 11h11', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' }),
        h('circle', { cx: 6, cy: 5, r: 1.6, fill: 'none', stroke: 'currentColor', strokeWidth: 1.2 }),
        h('circle', { cx: 10.5, cy: 11, r: 1.6, fill: 'none', stroke: 'currentColor', strokeWidth: 1.2 }),
      );
    }

