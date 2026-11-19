/**
 * Component-local stylesheet. Only --dsw-alias-* theme tokens; the shell's layout custom properties are read with fallbacks.
 *
 * This file is a fragment of the single client bundle. build.mjs concatenates
 * the sections in name order inside the factory closure, so declarations are
 * shared across files and no import statements are needed.
 */
    const CSS = `
.dsh-fc-root {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
  line-height: 16px;
}
/* The sidebar viewport is a size container but has no definite height, so the
   region caps itself in container-query units (the shipped browser's pattern)
   instead of a percentage height. */
.dsh-fc-root.is-wide {
  flex: none;
  max-height: 100%;
  max-height: 100cqh;
}
.dsh-fc-head {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 10px 6px var(--dsh-sidebar-row-padding, 12px);
  flex: none;
  /* Stays put even if the sidebar viewport ever scrolls this region. */
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--dsw-specific-sidebar-fill);
}
.dsh-fc-headTitle {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--dsw-alias-label-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsh-fc-iconbtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  flex: none;
}
.dsh-fc-iconbtn:hover {
  background: var(--dsw-alias-bg-layer-2);
  border-color: var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-primary);
}
.dsh-fc-iconbtn:disabled { opacity: 0.5; cursor: default; }
.dsh-fc-notice {
  flex: none;
  padding: 0 12px 6px 12px;
  font-size: 11px;
  color: var(--dsw-alias-state-error-primary);
}
.dsh-fc-body { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
.dsh-fc-scrollRegion {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.dsh-fc-scroller {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.dsh-fc-scroller::-webkit-scrollbar { width: 0; height: 0; }
.dsh-fc-track {
  position: absolute;
  top: 2px;
  right: 2px;
  bottom: 2px;
  width: 10px;
  border-radius: 5px;
}
.dsh-fc-thumb {
  position: absolute;
  right: 2px;
  width: 6px;
  min-height: 18px;
  border-radius: 3px;
  background: var(--dsw-alias-label-secondary);
  opacity: 0;
  pointer-events: none;
  cursor: pointer;
  touch-action: none;
  /* Fade out slowly once the pointer leaves; the reveal below is quicker. */
  transition: opacity 450ms cubic-bezier(0.33, 0, 0.2, 1);
}
/* Revealed while the pointer is anywhere in the scroll region, and held open
   while it is hovered, dragged or keyboard-focused. */
.dsh-fc-scrollRegion:hover .dsh-fc-thumb,
.dsh-fc-scrollRegion:focus-within .dsh-fc-thumb,
.dsh-fc-thumb.is-dragging {
  opacity: 0.5;
  pointer-events: auto;
  transition: opacity 150ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
.dsh-fc-thumb:hover { opacity: 0.78; transition-duration: 120ms; }
.dsh-fc-thumb:active,
.dsh-fc-scrollRegion .dsh-fc-thumb.is-dragging { opacity: 0.88; }
.dsh-fc-thumb:focus-visible {
  opacity: 0.88;
  outline: 1px solid var(--dsw-alias-brand-primary);
  outline-offset: 1px;
}
.dsh-fc-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  /* The extra bottom inset clears the shell's 24px scroll fade so the last
     card can still be scrolled fully into view. */
  padding: 2px 16px 28px var(--dsh-sidebar-inline-padding, 10px);
}
.dsh-fc-cardWrap { position: relative; min-width: 0; }
.dsh-fc-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-end;
  gap: 4px;
  width: 100%;
  aspect-ratio: 3 / 4;
  padding: 6px 6px 8px 6px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  text-align: inherit;
  cursor: pointer;
  overflow: hidden;
  outline: none;
  transition: border-color 120ms ease, background 120ms ease;
}
.dsh-fc-card:hover {
  background: var(--dsw-alias-bg-layer-2);
  border-color: var(--dsw-alias-border-l2);
}
.dsh-fc-card:focus-visible {
  border-color: var(--dsw-alias-brand-primary);
  box-shadow: 0 0 0 1px var(--dsw-alias-brand-primary);
}
.dsh-fc-card.has-image { padding: 0; }
.dsh-fc-glyph {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  color: var(--dsw-alias-label-secondary);
}
.dsh-fc-card:hover .dsh-fc-glyph { color: var(--dsw-alias-brand-primary); }
.dsh-fc-glyph svg { width: 42%; height: auto; max-height: 46px; }
.dsh-fc-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dsh-fc-name {
  flex: none;
  position: relative;
  font-size: 11px;
  line-height: 15px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--dsw-alias-label-primary);
}
.dsh-fc-card.has-image .dsh-fc-name {
  padding: 3px 6px;
  background: var(--dsw-alias-bg-overlay);
  border-top: 1px solid var(--dsw-alias-border-l1);
}
/* A running folder turns its bottom line into "name · working here" and
   scrolls it right to left, because the sentence is wider than the card. */
.dsh-fc-name.is-marquee {
  display: block;
  overflow: hidden;
  text-align: left;
}
.dsh-fc-nameTrack {
  display: inline-flex;
  gap: 18px;
  white-space: nowrap;
  animation: dsh-fc-marquee 9s linear infinite;
  will-change: transform;
}
.dsh-fc-nameChunk { white-space: nowrap; }
.dsh-fc-card:hover .dsh-fc-nameTrack { animation-play-state: paused; }
@keyframes dsh-fc-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
/* "叮，完成了！" bubble over a card whose run just finished on screen. */
.dsh-fc-done {
  position: absolute;
  left: 50%;
  bottom: 30px;
  z-index: 3;
  padding: 2px 7px;
  border: 1px solid var(--dsw-alias-state-success-primary);
  border-radius: 999px;
  background: var(--dsw-alias-bg-overlay);
  color: var(--dsw-alias-state-success-primary);
  font-size: 10px;
  line-height: 14px;
  white-space: nowrap;
  pointer-events: none;
  animation: dsh-fc-done-pop 2.4s ease-out forwards;
}
.dsh-fc-card.has-image .dsh-fc-done { bottom: 52px; }
@keyframes dsh-fc-done-pop {
  0% { opacity: 0; transform: translate(-50%, 8px) scale(0.7); }
  12% { opacity: 1; transform: translate(-50%, 0) scale(1.06); }
  22% { transform: translate(-50%, 0) scale(1); }
  72% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -6px) scale(1); }
}
.dsh-fc-tools {
  position: absolute;
  top: 3px;
  right: 3px;
  display: flex;
  gap: 2px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms ease;
}
.dsh-fc-cardWrap:hover .dsh-fc-tools,
.dsh-fc-cardWrap:focus-within .dsh-fc-tools {
  opacity: 1;
  pointer-events: auto;
}
.dsh-fc-tool {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  background: var(--dsw-alias-bg-overlay);
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}
.dsh-fc-tool:hover { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-border-l2); }
.dsh-fc-panel { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
.dsh-fc-panelHead {
  flex: none;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 6px 6px;
}
.dsh-fc-back {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  height: 24px;
  padding: 0 8px 0 4px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  flex: none;
}
.dsh-fc-back:hover {
  background: var(--dsw-alias-bg-layer-2);
  border-color: var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-primary);
}
.dsh-fc-back:focus-visible {
  border-color: var(--dsw-alias-brand-primary);
  color: var(--dsw-alias-label-primary);
}
.dsh-fc-panelTitle {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsh-fc-rows {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0 14px 28px 6px;
}
.dsh-fc-row {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-height: 30px;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  flex: none;
}
.dsh-fc-row:hover { background: var(--dsw-alias-bg-layer-2); }
.dsh-fc-row:focus-visible { border-color: var(--dsw-alias-brand-primary); }
.dsh-fc-row.is-current { background: var(--dsw-alias-bg-layer-2); border-color: var(--dsw-alias-border-l1); }
.dsh-fc-rowTitle { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dsh-fc-rowTime { flex: none; font-size: 11px; color: var(--dsw-alias-label-secondary); }
.dsh-fc-dot {
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--dsw-alias-state-idle-primary);
  opacity: 0.55;
}
.dsh-fc-dot.is-running { background: var(--dsw-alias-brand-primary); opacity: 1; }
/* Amber waits for the user; green is a finished run not opened yet. */
.dsh-fc-dot.is-pending { background: var(--dsw-alias-state-warn-primary); opacity: 1; }
.dsh-fc-dot.is-done { background: var(--dsw-alias-state-success-primary); opacity: 1; }
.dsh-fc-row.is-new { color: var(--dsw-alias-label-secondary); }
.dsh-fc-row.is-new:hover { color: var(--dsw-alias-label-primary); }
.dsh-fc-empty {
  padding: 22px 14px;
  text-align: center;
  font-size: 12px;
  color: var(--dsw-alias-label-secondary);
}
.dsh-fc-rail {
  align-items: center;
  gap: 6px;
  padding: 6px 0 12px 0;
  overflow-y: auto;
}
.dsh-fc-railBtn {
  position: relative;
  flex: none;
  width: 38px;
  height: 46px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 9px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  overflow: hidden;
}
.dsh-fc-railBtn:hover { color: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-border-l2); }
.dsh-fc-railBtn img { width: 100%; height: 100%; object-fit: cover; }
.dsh-fc-railBtn svg { width: 20px; height: 20px; }
.dsh-fc-file { display: none; }
/* Bottom-left attention dot on a folder card: amber means the folder waits for
   an approval, a plan review or an answer; green means a run finished and has
   not been opened yet. */
.dsh-fc-badge {
  position: absolute;
  left: 6px;
  bottom: 6px;
  z-index: 2;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dsw-alias-state-warn-primary);
  box-shadow: 0 0 0 2px var(--dsw-alias-bg-layer-1);
  pointer-events: none;
}
.dsh-fc-card.has-image .dsh-fc-badge { bottom: 27px; }
.dsh-fc-badge.is-done { background: var(--dsw-alias-state-success-primary); }
.dsh-fc-badge.is-pending { animation: dsh-fc-badge-pulse 1.9s ease-in-out infinite; }
/* The folder the main conversation lives in: a small wiggle once every few
   seconds plus a brand border, so "where I am working" reads at a glance
   without pulling attention constantly. */
.dsh-fc-card.is-active,
.dsh-fc-railBtn.is-active { border-color: var(--dsw-alias-brand-primary); }
.dsh-fc-card.is-active,
.dsh-fc-railBtn.is-active { animation: dsh-fc-working 4.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite; }
@keyframes dsh-fc-working {
  0%, 100% { transform: rotate(0deg); }
  2% { transform: rotate(-0.9deg); }
  4% { transform: rotate(0.9deg); }
  6% { transform: rotate(-0.6deg); }
  8% { transform: rotate(0.6deg); }
  10% { transform: rotate(-0.3deg); }
  12% { transform: rotate(0.3deg); }
  14% { transform: rotate(0deg); }
}
/* Settings switches: the borders stay as static cues, the motion stops. */
.dsh-fc-root.no-wiggle .dsh-fc-card.is-active,
.dsh-fc-root.no-wiggle .dsh-fc-railBtn.is-active { animation: none; }
.dsh-fc-root.no-celebrate .dsh-fc-done { display: none; }
@keyframes dsh-fc-badge-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.35); opacity: 0.72; }
}
/* Header reminder while a folder is open: the other folders' counts stay in
   sight, and clicking it goes back to the grid. */
.dsh-fc-reminder {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 20px;
  padding: 0 6px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  flex: none;
}
.dsh-fc-reminder:hover {
  border-color: var(--dsw-alias-border-l2);
  color: var(--dsw-alias-label-primary);
}
.dsh-fc-reminderItem { display: inline-flex; align-items: center; gap: 3px; line-height: 1; }
.dsh-fc-reminderDot { width: 6px; height: 6px; border-radius: 50%; flex: none; }
.dsh-fc-reminderDot.is-done { background: var(--dsw-alias-state-success-primary); }
.dsh-fc-reminderDot.is-pending {
  background: var(--dsw-alias-state-warn-primary);
  animation: dsh-fc-badge-pulse 1.9s ease-in-out infinite;
}
.dsh-fc-search {
  flex: 1;
  min-width: 0;
  height: 24px;
  padding: 0 7px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 7px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  outline: none;
}
.dsh-fc-search:focus { border-color: var(--dsw-alias-brand-primary); }
.dsh-fc-search::placeholder { color: var(--dsw-alias-label-secondary); }
.dsh-fc-results {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 14px 28px 8px;
}
.dsh-fc-result {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 100%;
  padding: 5px 8px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.dsh-fc-result:hover { background: var(--dsw-alias-bg-layer-2); }
.dsh-fc-result:focus-visible { border-color: var(--dsw-alias-brand-primary); }
.dsh-fc-result.is-workspace { border-style: dashed; }
.dsh-fc-result.is-archived { color: var(--dsw-alias-label-secondary); cursor: default; }
.dsh-fc-resultTitle { font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dsh-fc-resultMeta { font-size: 11px; color: var(--dsw-alias-label-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dsh-fc-rowWrap { position: relative; flex: none; }
.dsh-fc-rowWrap .dsh-fc-row { padding-right: 27px; }
.dsh-fc-rowMenuBtn {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 5px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  opacity: 0;
}
.dsh-fc-rowWrap:hover .dsh-fc-rowMenuBtn,
.dsh-fc-rowWrap:focus-within .dsh-fc-rowMenuBtn { opacity: 1; }
.dsh-fc-rowMenuBtn:hover { background: var(--dsw-alias-bg-overlay); color: var(--dsw-alias-label-primary); }
.dsh-fc-rowWrap:hover .dsh-fc-rowTime { opacity: 0; }
.dsh-fc-archivedToggle { color: var(--dsw-alias-label-secondary); font-size: 11px; }
.dsh-fc-backdrop { position: absolute; inset: 0; z-index: 4; background: transparent; }
.dsh-fc-settingsPop {
  position: absolute;
  top: 38px;
  right: 8px;
  z-index: 5;
  width: 252px;
  max-height: calc(100% - 48px);
  overflow-y: auto;
  padding: 10px 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 10px;
  background: var(--dsw-alias-bg-overlay);
  box-shadow: 0 6px 16px var(--dsw-alias-border-l1);
}
.dsh-fc-viewLabel {
  padding: 0 2px 6px 2px;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary);
}
.dsh-fc-seg { display: flex; gap: 4px; }
.dsh-fc-segBtn {
  flex: 1;
  height: 24px;
  padding: 0 6px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.dsh-fc-segBtn.is-active {
  border-color: var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
}
.dsh-fc-fallback {
  position: absolute;
  z-index: 6;
  min-width: 130px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 10px;
  background: var(--dsw-alias-bg-overlay);
  box-shadow: 0 6px 16px var(--dsw-alias-border-l1);
}
.dsh-fc-fallbackItem {
  display: flex;
  align-items: center;
  height: 26px;
  padding: 0 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}
.dsh-fc-fallbackItem:hover { background: var(--dsw-alias-bg-layer-2); }
.dsh-fc-rename {
  width: 100%;
  height: 26px;
  padding: 0 6px;
  border: 1px solid var(--dsw-alias-brand-primary);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  outline: none;
}
/* Droplet pulse at the pressed card, and the next level surfacing under it. */
.dsh-fc-pulse {
  position: absolute;
  inset: 0;
  z-index: 3;
  overflow: hidden;
  pointer-events: none;
}
.dsh-fc-ripple {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 1.5px solid var(--dsw-alias-brand-primary);
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.06);
  animation: dsh-fc-ripple 640ms cubic-bezier(0.16, 0.84, 0.32, 1) forwards;
  will-change: transform, opacity;
}
.dsh-fc-ripple.is-late { animation-delay: 110ms; }
.dsh-fc-ripple.is-core {
  border: 0;
  background: radial-gradient(circle, var(--dsw-alias-brand-primary) 0%, transparent 72%);
  animation-duration: 460ms;
}
@keyframes dsh-fc-ripple {
  0% { opacity: 0.55; transform: translate(-50%, -50%) scale(0.06); }
  65% { opacity: 0.18; }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
}
.dsh-fc-panel { animation: dsh-fc-level-in 240ms cubic-bezier(0.22, 0.61, 0.36, 1); }
/* On the way back the rings collapse into the point instead of spreading. */
.dsh-fc-ripple.is-reverse { animation-name: dsh-fc-ripple-back; }
.dsh-fc-ripple.is-core.is-reverse { animation-name: dsh-fc-ripple-back; }
@keyframes dsh-fc-ripple-back {
  0% { opacity: 0.42; transform: translate(-50%, -50%) scale(1); }
  70% { opacity: 0.16; }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(0.05); }
}
.dsh-fc-scrollRegion { animation: dsh-fc-level-in 200ms ease-out; }
@keyframes dsh-fc-level-in {
  from { opacity: 0; transform: translateY(7px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (hover: none) {
  .dsh-fc-tools { opacity: 1; pointer-events: auto; }
  .dsh-fc-thumb { opacity: 0.5; pointer-events: auto; }
  .dsh-fc-rowMenuBtn { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .dsh-fc-card, .dsh-fc-tools, .dsh-fc-thumb { transition: none; }
  .dsh-fc-panel, .dsh-fc-scrollRegion { animation: none; }
  .dsh-fc-ripple { display: none; }
  .dsh-fc-badge.is-pending { animation: none; }
  .dsh-fc-reminderDot.is-pending { animation: none; }
  .dsh-fc-card.is-active, .dsh-fc-railBtn.is-active { animation: none; }
  .dsh-fc-nameTrack { animation: none; }
  .dsh-fc-done { animation: none; opacity: 1; }
}
`;

