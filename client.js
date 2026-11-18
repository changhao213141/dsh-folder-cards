window.__ModuleLoader__.load({
  id: 'dsh-folder-cards',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useCallback, useEffect, useMemo, useRef, useState } = React;

/**
 * Constants shared by every section: locale namespace, storage keys, image limits, empty snapshots.
 *
 * This file is a fragment of the single client bundle. build.mjs concatenates
 * the sections in name order inside the factory closure, so declarations are
 * shared across files and no import statements are needed.
 */
    /** Locale namespace owned by this plugin. */
    const NS = 'folderCards';
    /** Browser-local storage for the per-workspace card artwork. */
    const STORE_KEY = 'dsh.folderCards.v1';
    /** Longest edge kept when a picked image is downscaled for storage. */
    const MAX_EDGE = 320;
    /** Picked files above this size are refused before decoding. */
    const MAX_FILE_BYTES = 25 * 1024 * 1024;
    /** Synthetic workspace id for sessions that belong to no workspace. */
    const UNGROUPED_KEY = '\u0000ungrouped';

    const EMPTY_WORKSPACES = { items: [], pinnedSessionIds: [], archivedSessionIds: [] };
    const EMPTY_SESSIONS = { ids: [], byId: {} };

/**
 * Baseline zh/en dictionaries; English is the locale service's fallback.
 *
 * This file is a fragment of the single client bundle. build.mjs concatenates
 * the sections in name order inside the factory closure, so declarations are
 * shared across files and no import statements are needed.
 */
    /** Baseline dictionaries; English is the locale service's fallback. */
    const zh = {
      workspaces: '工作区',
      ungrouped: '未分组',
      unnamedWorkspace: '未命名工作区',
      addWorkspace: '添加工作区',
      back: '返回',
      newSession: '新会话',
      empty: '这个文件夹里还没有会话',
      noFolders: '还没有工作区',
      untitled: '未命名会话',
      running: '运行中',
      loading: '正在加载工作区…',
      loadFailed: '工作区没有加载出来',
      pickerUnavailable: '这个环境没有可用的目录选择器',
      changeImage: '插入图片',
      resetImage: '恢复默认外观',
      addFailed: '创建工作区失败',
      processing: '处理图片中…',
      imageTooLarge: '图片太大，换一张小一点的',
      imageFailed: '这张图片读不出来',
      storageFailed: '浏览器本地存不下这张图片',
      archived: '已归档',
      restore: '恢复',
      showArchived: '已归档 {n} 个',
      hideArchived: '收起已归档',
      search: '搜索',
      searchPlaceholder: '搜索文件夹或会话…',
      noMatch: '没有匹配的文件夹或会话',
      searching: '正在搜索…',
      clearSearch: '关闭搜索',
      sessionMenu: '会话操作',
      viewOptions: '视图选项',
      sortBy: '排序',
      sortManual: '默认顺序',
      sortRecent: '最近活跃',
      rename: '重命名',
      fork: '分叉会话',
      copyId: '复制会话 ID',
      archive: '归档',
      unarchive: '取消归档',
      renameFailed: '重命名失败',
      forkFailed: '分叉失败',
      archiveFailed: '归档操作失败',
      'time.now': '刚刚',
      'time.minutes': '{n} 分钟',
      'time.hours': '{n} 小时',
      'time.days': '{n} 天',
    };
    const en = {
      workspaces: 'Workspaces',
      ungrouped: 'Ungrouped',
      unnamedWorkspace: 'Untitled workspace',
      addWorkspace: 'Add workspace',
      back: 'Back',
      newSession: 'New session',
      empty: 'No conversations in this folder yet',
      noFolders: 'No workspaces yet',
      untitled: 'Untitled',
      running: 'Running',
      loading: 'Loading workspaces…',
      loadFailed: 'Workspaces could not be loaded',
      pickerUnavailable: 'No directory picker is available here',
      changeImage: 'Insert image',
      resetImage: 'Reset artwork',
      addFailed: 'Could not create the workspace',
      processing: 'Processing image…',
      imageTooLarge: 'That image is too large; pick a smaller one',
      imageFailed: 'Could not read that image',
      storageFailed: 'The browser could not store that image',
      archived: 'Archived',
      restore: 'Restore',
      showArchived: 'Archived ({n})',
      hideArchived: 'Hide archived',
      search: 'Search',
      searchPlaceholder: 'Search folders or conversations…',
      noMatch: 'No matching folder or conversation',
      searching: 'Searching…',
      clearSearch: 'Close search',
      sessionMenu: 'Conversation actions',
      viewOptions: 'View options',
      sortBy: 'Sort',
      sortManual: 'Folder order',
      sortRecent: 'Recent activity',
      rename: 'Rename',
      fork: 'Fork conversation',
      copyId: 'Copy conversation ID',
      archive: 'Archive',
      unarchive: 'Unarchive',
      renameFailed: 'Rename failed',
      forkFailed: 'Fork failed',
      archiveFailed: 'Archive action failed',
      'time.now': 'now',
      'time.minutes': '{n} min',
      'time.hours': '{n} h',
      'time.days': '{n} d',
    };

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
.dsh-fc-viewMenu {
  position: absolute;
  top: 38px;
  right: 8px;
  z-index: 5;
  min-width: 150px;
  padding: 8px;
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
}
`;

/**
 * Browser-local persistence: per-folder card artwork and view preferences (sort, last opened folder).
 *
 * This file is a fragment of the single client bundle. build.mjs concatenates
 * the sections in name order inside the factory closure, so declarations are
 * shared across files and no import statements are needed.
 */
    /* ---------- storage ---------- */

    function readImages() {
      try {
        const raw = window.localStorage.getItem(STORE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        const images = parsed && typeof parsed.images === 'object' && parsed.images !== null ? parsed.images : {};
        const clean = {};
        for (const [key, value] of Object.entries(images)) {
          if (typeof value === 'string' && value.indexOf('data:image/') === 0) clean[key] = value;
        }
        return clean;
      } catch (error) {
        return {};
      }
    }

    function writeImages(images) {
      try {
        window.localStorage.setItem(STORE_KEY, JSON.stringify({ version: 1, images }));
        return '';
      } catch (error) {
        return error && error.name === 'QuotaExceededError' ? 'tooLarge' : 'storage';
      }
    }

    /** View preferences: card order and the folder to reopen. */
    const PREFS_KEY = 'dsh.folderCards.prefs.v1';

    function readPrefs() {
      try {
        const raw = window.localStorage.getItem(PREFS_KEY);
        if (!raw) return { sort: 'manual', lastOpenId: null };
        const parsed = JSON.parse(raw);
        return {
          sort: parsed && parsed.sort === 'recent' ? 'recent' : 'manual',
          lastOpenId: parsed && typeof parsed.lastOpenId === 'string' && parsed.lastOpenId !== ''
            ? parsed.lastOpenId
            : null,
        };
      } catch (error) {
        return { sort: 'manual', lastOpenId: null };
      }
    }

    function writePrefs(prefs) {
      try {
        window.localStorage.setItem(PREFS_KEY, JSON.stringify({ version: 1, ...prefs }));
        return true;
      } catch (error) {
        return false;
      }
    }

/**
 * Pure helpers: titles, relative time, running state, image downscaling.
 *
 * This file is a fragment of the single client bundle. build.mjs concatenates
 * the sections in name order inside the factory closure, so declarations are
 * shared across files and no import statements are needed.
 */
    /* ---------- small helpers ---------- */

    function basename(path) {
      if (typeof path !== 'string' || path === '') return '';
      const parts = path.split(/[\\/]+/).filter(Boolean);
      return parts.length === 0 ? '' : parts[parts.length - 1];
    }

    function workspaceTitle(item, t) {
      const title = typeof item.title === 'string' ? item.title.trim() : '';
      return title || basename(item.path) || t('unnamedWorkspace');
    }

    function isRunning(statuses, summary) {
      try {
        if (statuses && typeof statuses.get === 'function') {
          const status = statuses.get(summary.id);
          if (status && typeof status.running === 'boolean') return status.running;
        }
      } catch (error) {
        /* fall through to the catalog flag */
      }
      return summary.running === true;
    }

    function timeLabel(updatedAt, now, t) {
      if (!Number.isFinite(updatedAt) || updatedAt <= 0) return '';
      const minutes = Math.floor(Math.max(0, now - updatedAt) / 60000);
      if (minutes < 1) return t('time.now');
      if (minutes < 60) return t('time.minutes', { n: minutes });
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return t('time.hours', { n: hours });
      const days = Math.floor(hours / 24);
      if (days < 30) return t('time.days', { n: days });
      try {
        return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(updatedAt));
      } catch (error) {
        return '';
      }
    }

    function shrinkImage(file, maxEdge) {
      return new Promise((resolve, reject) => {
        if (file.size > MAX_FILE_BYTES) {
          reject(new Error('file too large'));
          return;
        }
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
          try {
            const sourceWidth = image.naturalWidth || image.width;
            const sourceHeight = image.naturalHeight || image.height;
            const longest = Math.max(sourceWidth, sourceHeight);
            const scale = longest > 0 ? Math.min(1, maxEdge / longest) : 1;
            const width = Math.max(1, Math.round(sourceWidth * scale));
            const height = Math.max(1, Math.round(sourceHeight * scale));
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext('2d');
            if (!context) throw new Error('canvas unavailable');
            context.drawImage(image, 0, 0, width, height);
            let dataUrl = canvas.toDataURL('image/webp', 0.86);
            if (typeof dataUrl !== 'string' || dataUrl.indexOf('data:image/webp') !== 0) {
              dataUrl = canvas.toDataURL('image/png');
            }
            resolve(dataUrl);
          } catch (error) {
            reject(error);
          } finally {
            URL.revokeObjectURL(objectUrl);
          }
        };
        image.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('image decode failed'));
        };
        image.src = objectUrl;
      });
    }

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

/**
 * The sidebar region: card grid, session panel, search, archived trailer, view options and the plugin-local menu.
 *
 * This file is a fragment of the single client bundle. build.mjs concatenates
 * the sections in name order inside the factory closure, so declarations are
 * shared across files and no import statements are needed.
 */
    /* ---------- component ---------- */

    function FolderCards(props) {
      const api = props && typeof props.api === 'object' && props.api !== null ? props.api : {};
      const translate = useCallback((key, params) => {
        try {
          if (typeof props.t === 'function') {
            const value = props.t(key, params);
            if (typeof value === 'string' && value !== '') return value;
          }
          const value = typeof api.t === 'function' ? api.t(key) : key;
          if (typeof value !== 'string' || value === '') return key;
          if (!params) return value;
          return value.replace(/\{(\w+)\}/g, (match, name) => name in params ? String(params[name]) : match);
        } catch (error) {
          return key;
        }
      }, [api, props.t]);
      const t = translate;

      const wide = props.wide !== false;
      const useWorkspaces = typeof props.useWorkspaces === 'function' ? props.useWorkspaces : () => EMPTY_WORKSPACES;
      const useSessions = typeof props.useSessions === 'function' ? props.useSessions : () => EMPTY_SESSIONS;
      const useSessionStatus = typeof props.useSessionStatus === 'function' ? props.useSessionStatus : () => null;

      /* Slot-provided hook: registers this region's own scroller with the
         sidebar's wheel hand-off, so a gesture that reaches this scroller's
         end keeps moving the sidebar viewport (and vice versa). */
      const useSectionScroller = typeof props.useSectionScroller === 'function' ? props.useSectionScroller : null;
      const sectionScroller = useSectionScroller === null ? null : useSectionScroller();
      const bindScroller = sectionScroller && typeof sectionScroller.bindScrollerRef === 'function'
        ? sectionScroller.bindScrollerRef
        : null;

      const workspaceState = useWorkspaces(state => state) || EMPTY_WORKSPACES;
      const sessionState = useSessions(state => state) || EMPTY_SESSIONS;
      const statuses = useSessionStatus(state => state) || null;

      const [openId, setOpenId] = useState(() => readPrefs().lastOpenId);
      const [images, setImages] = useState(readImages);
      const [busy, setBusy] = useState(false);
      const [notice, setNotice] = useState('');
      const [now, setNow] = useState(() => Date.now());
      const [query, setQuery] = useState('');
      const [searchOpen, setSearchOpen] = useState(false);
      const [remoteSearch, setRemoteSearch] = useState({ query: '', status: 'idle', items: [] });
      const [showArchived, setShowArchived] = useState(false);
      const [sort, setSort] = useState(() => readPrefs().sort);
      const [viewOpen, setViewOpen] = useState(false);
      const [fallbackMenu, setFallbackMenu] = useState(null);
      const [renaming, setRenaming] = useState(null);
      const viewMenuRef = useRef(null);
      const viewButtonRef = useRef(null);
      const fallbackRef = useRef(null);
      const renamePending = useRef(null);
      const fileRef = useRef(null);
      const searchInputRef = useRef(null);
      const targetRef = useRef(null);
      const backRef = useRef(null);
      const cardRefs = useRef(new Map());
      const rootRef = useRef(null);
      const [availHeight, setAvailHeight] = useState(null);

      /* The shell's scrollArea scrolls the navigation away before the section
         scrolls, which would carry this region's header along and hide the
         top cards behind it. Sizing the region so the outer viewport never
         overflows keeps the whole sidebar fixed and leaves only the card
         area scrollable.

         The size is closed-loop: measure how much the outer viewport
         currently overflows, subtract exactly that from the region, and the
         outer settles at zero overflow regardless of how the shell is built. */
      const measureAvail = useCallback(() => {
        const element = rootRef.current;
        const area = element && element.parentElement;
        if (!element || !area) return;
        let scroller = area.parentElement;
        while (scroller && scroller !== document.body) {
          const overflowY = window.getComputedStyle(scroller).overflowY;
          if (overflowY === 'auto' || overflowY === 'scroll') break;
          scroller = scroller.parentElement;
        }
        if (!scroller || scroller === document.body) return;
        const height = element.getBoundingClientRect().height;
        if (!(height > 0)) return;
        const available = scroller.clientHeight;
        const overflow = scroller.scrollHeight - available;
        let next = height;
        if (overflow > 1) {
          /* Shrink by the measured overflow plus a pixel of slack. */
          next = height - overflow - 2;
        } else {
          /* The shell changed above the region (a panel row came or went):
             reclaim the leftover space, with a dead band against oscillation. */
          const leftover = available - scroller.scrollHeight;
          if (leftover > 8) next = height + leftover - 4;
        }
        next = Math.max(120, Math.round(next));
        if (Math.abs(next - Math.round(height)) <= 1) return;
        setAvailHeight(next);
      }, []);

      const resetAvail = useCallback(() => {
        setAvailHeight(previous => previous === null ? previous : null);
        if (typeof window.requestAnimationFrame === 'function') {
          window.requestAnimationFrame(() => measureAvail());
        } else {
          setTimeout(measureAvail, 0);
        }
      }, [measureAvail]);

      useEffect(() => {
        if (!wide) {
          setAvailHeight(previous => previous === null ? previous : null);
          return undefined;
        }
        measureAvail();
        const onResize = () => resetAvail();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
      }, [wide, measureAvail, resetAvail]);

      /* Content and shell rows change between renders; keep correcting. */
      useEffect(() => {
        if (wide) measureAvail();
      });
      const lastOpened = useRef(null);

      const items = Array.isArray(workspaceState.items) ? workspaceState.items : [];
      const byId = sessionState.byId && typeof sessionState.byId === 'object' ? sessionState.byId : {};
      const pinnedIds = Array.isArray(workspaceState.pinnedSessionIds) ? workspaceState.pinnedSessionIds : [];
      const archivedIds = Array.isArray(workspaceState.archivedSessionIds) ? workspaceState.archivedSessionIds : [];
      const sessionIds = Array.isArray(sessionState.ids) ? sessionState.ids : Object.keys(byId);

      /* Sessions that belong to no workspace at all (a session created without
         one, or left behind by a deleted workspace). The shipped browser keeps
         them in an "ungrouped" bucket; so does this region, as its own card. */
      const ungrouped = useMemo(() => {
        const accounted = new Set();
        for (const item of items) {
          for (const id of Array.isArray(item.sessionIds) ? item.sessionIds : []) accounted.add(id);
        }
        const rows = [];
        for (const id of sessionIds) {
          if (accounted.has(id)) continue;
          const summary = byId[id];
          if (!summary) continue;
          if (summary.origin === 'subagent') continue;
          if (summary.blank === true) continue;
          rows.push(id);
        }
        return rows;
      }, [items, sessionIds, byId]);

      const openWorkspace = useMemo(() => {
        if (openId === null) return null;
        if (openId === UNGROUPED_KEY) {
          return ungrouped.length === 0 ? null : {
            workspaceId: UNGROUPED_KEY,
            title: t('ungrouped'),
            path: '',
            sessionIds: ungrouped,
            ungrouped: true,
          };
        }
        return items.find(item => item.workspaceId === openId) || null;
      }, [openId, items, ungrouped, t]);

      useEffect(() => {
        if (openId !== null && openWorkspace === null) setOpenId(null);
      }, [openId, openWorkspace]);

      /* Clear a stale notice and collapse the archived trailer on level changes. */
      useEffect(() => {
        setNotice('');
        setShowArchived(false);
        setFallbackMenu(null);
      }, [openId]);

      /* Remember the view choice and the folder to reopen after a reload. */
      useEffect(() => {
        writePrefs({ sort, lastOpenId: openId });
      }, [sort, openId]);

      /* Dismiss plugin-local popovers on an outside press. */
      useEffect(() => {
        if (!viewOpen && fallbackMenu === null) return undefined;
        const onDown = event => {
          const target = event.target;
          const inMenu = viewMenuRef.current && viewMenuRef.current.contains(target);
          const inButton = viewButtonRef.current && viewButtonRef.current.contains(target);
          const inFallback = fallbackRef.current && fallbackRef.current.contains(target);
          if (!inMenu && !inButton && !inFallback) {
            setViewOpen(false);
            setFallbackMenu(null);
          }
        };
        document.addEventListener('pointerdown', onDown, true);
        return () => document.removeEventListener('pointerdown', onDown, true);
      }, [viewOpen, fallbackMenu]);

      /* Debounced content search against the Host index, cancelled on change. */
      useEffect(() => {
        const text = query.trim();
        if (text === '') {
          setRemoteSearch(previous => (
            previous.status === 'idle' && previous.items.length === 0 ? previous : { query: '', status: 'idle', items: [] }
          ));
          return undefined;
        }
        let cancelled = false;
        const controller = typeof AbortController === 'function' ? new AbortController() : null;
        const timer = setTimeout(async () => {
          setRemoteSearch({ query: text, status: 'loading', items: [] });
          try {
            const items = await api.searchSessions(text, controller ? controller.signal : undefined);
            if (cancelled) return;
            setRemoteSearch({ query: text, status: 'ready', items: Array.isArray(items) ? items : [] });
          } catch (error) {
            if (cancelled) return;
            setRemoteSearch({ query: text, status: 'error', items: [] });
          }
        }, 250);
        return () => {
          cancelled = true;
          clearTimeout(timer);
          if (controller) controller.abort();
        };
      }, [query, api]);

      /* Put the caret in the search field as soon as it opens. */
      useEffect(() => {
        if (!searchOpen) return;
        const input = searchInputRef.current;
        if (input) input.focus();
      }, [searchOpen]);

      /* Keep "刚刚 / 5 分钟" fresh while the sidebar idles. */
      useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(timer);
      }, []);

      /* Move focus with the user: into the session panel, then back to the
         card that opened it. */
      useEffect(() => {
        if (openId !== null) {
          if (backRef.current) backRef.current.focus();
          return;
        }
        const previous = lastOpened.current;
        lastOpened.current = null;
        if (previous === null) return;
        const card = cardRefs.current.get(previous);
        if (card) card.focus();
      }, [openId]);

      const currentSessionId = useMemo(() => {
        for (const id of sessionIds) {
          const summary = byId[id];
          if (summary && summary.retainedBy && (summary.retainedBy.mainView || 0) > 0) return id;
        }
        return null;
      }, [sessionIds, byId]);

      const sessions = useMemo(() => {
        if (openWorkspace === null) return [];
        const pinned = new Set(pinnedIds);
        const seen = new Set();
        const rows = [];
        const memberIds = Array.isArray(openWorkspace.sessionIds) ? openWorkspace.sessionIds : [];
        for (const id of memberIds) {
          if (seen.has(id)) continue;
          seen.add(id);
          const summary = byId[id];
          if (!summary) continue;
          if (summary.origin === 'subagent') continue;
          if (summary.blank === true) continue;
          /* Archived Sessions are not openable and the shipped sidebar hides
             them by default; a dead row here would only confuse. */
          if (archivedIds.includes(id)) continue;
          const title = typeof summary.title === 'string' && summary.title.trim() !== ''
            ? summary.title.trim()
            : t('untitled');
          rows.push({
            id,
            title,
            pinned: pinned.has(id),
            running: isRunning(statuses, summary),
            updatedAt: Number(summary.updatedAt) || 0,
            current: id === currentSessionId,
          });
        }
        rows.sort((left, right) =>
          (Number(right.pinned) - Number(left.pinned)) || (right.updatedAt - left.updatedAt));
        return rows;
      }, [openWorkspace, byId, pinnedIds, archivedIds, currentSessionId, statuses, t]);

      /* Archived Sessions of the open folder stay reachable through the trailer
         instead of vanishing from the region. */
      const archivedSessions = useMemo(() => {
        if (openWorkspace === null) return [];
        const rows = [];
        for (const id of Array.isArray(openWorkspace.sessionIds) ? openWorkspace.sessionIds : []) {
          const summary = byId[id];
          if (!summary) continue;
          if (summary.origin === 'subagent') continue;
          if (!archivedIds.includes(id)) continue;
          rows.push({
            id,
            title: typeof summary.title === 'string' && summary.title.trim() !== '' ? summary.title.trim() : t('untitled'),
            updatedAt: Number(summary.updatedAt) || 0,
          });
        }
        rows.sort((left, right) => right.updatedAt - left.updatedAt);
        return rows;
      }, [openWorkspace, byId, archivedIds, t]);

      const workspaceNameOf = useCallback(sessionId => {
        for (const item of items) {
          if (Array.isArray(item.sessionIds) && item.sessionIds.indexOf(sessionId) >= 0) return workspaceTitle(item, t);
        }
        return t('ungrouped');
      }, [items, t]);

      /* One flat result list: matching folders first, then Session titles, then
         Host content hits that the titles did not already cover. */
      const searchResults = useMemo(() => {
        const text = query.trim().toLowerCase();
        if (text === '') return [];
        const rows = [];
        const seen = new Set();
        for (const item of items) {
          const title = workspaceTitle(item, t);
          const path = typeof item.path === 'string' ? item.path : '';
          if (title.toLowerCase().indexOf(text) >= 0 || path.toLowerCase().indexOf(text) >= 0) {
            rows.push({ key: 'w:' + item.workspaceId, type: 'workspace', id: item.workspaceId, title, meta: path || t('workspaces') });
          }
        }
        for (const id of sessionIds) {
          const summary = byId[id];
          if (!summary) continue;
          if (summary.origin === 'subagent') continue;
          if (summary.blank === true) continue;
          const title = typeof summary.title === 'string' ? summary.title.trim() : '';
          if (title === '' || title.toLowerCase().indexOf(text) < 0) continue;
          seen.add(id);
          rows.push({
            key: 's:' + id,
            type: 'session',
            id,
            title,
            meta: workspaceNameOf(id),
            archived: archivedIds.includes(id),
          });
        }
        if (remoteSearch.status === 'ready' && remoteSearch.query === query.trim()) {
          for (const hit of remoteSearch.items) {
            if (seen.has(hit.sessionId)) continue;
            seen.add(hit.sessionId);
            const summary = byId[hit.sessionId];
            rows.push({
              key: 'r:' + hit.sessionId,
              type: 'session',
              id: hit.sessionId,
              title: (summary && typeof summary.title === 'string' && summary.title.trim() !== '')
                ? summary.title.trim()
                : t('untitled'),
              meta: typeof hit.snippet === 'string' && hit.snippet.trim() !== ''
                ? hit.snippet.trim()
                : workspaceNameOf(hit.sessionId),
              archived: archivedIds.includes(hit.sessionId),
            });
          }
        }
        return rows.slice(0, 40);
      }, [query, items, sessionIds, byId, remoteSearch, archivedIds, workspaceNameOf, t]);

      const openSession = useCallback((sessionId) => {
        try {
          if (typeof api.open === 'function') api.open(sessionId);
        } catch (error) {
          console.warn('[folder-cards] open session failed', error);
        }
      }, [api]);

      const startSession = useCallback((workspaceId) => {
        try {
          if (typeof api.startSession === 'function') api.startSession(workspaceId);
        } catch (error) {
          console.warn('[folder-cards] start session failed', error);
        }
      }, [api]);

      /* Native menu first; when the shell's session menu is unavailable this
         plugin's own popover takes over so the actions never become dead. */
      const openSessionMenu = useCallback((sessionId, displayTitle, x, y) => {
        let available = true;
        try {
          available = typeof api.sessionMenuAvailable === 'function' ? api.sessionMenuAvailable() : false;
        } catch (error) {
          available = false;
        }
        if (available) {
          try {
            if (typeof api.openSessionMenu === 'function') api.openSessionMenu(sessionId, displayTitle, x, y);
            return;
          } catch (error) {
            console.warn('[folder-cards] native session menu failed, using fallback', error);
          }
        }
        const element = rootRef.current;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        setFallbackMenu({
          id: sessionId,
          title: displayTitle,
          x: Math.max(4, Math.min(Math.max(4, rect.width - 150), x - rect.left)),
          y: Math.max(4, Math.min(Math.max(4, rect.height - 170), y - rect.top)),
        });
      }, [api]);

      const beginRename = useCallback((sessionId, title) => {
        renamePending.current = { id: sessionId, value: title };
        setFallbackMenu(null);
        setRenaming({ id: sessionId, value: title });
      }, []);

      const commitRename = useCallback(async () => {
        const pending = renamePending.current;
        renamePending.current = null;
        setRenaming(null);
        if (!pending) return;
        const value = pending.value.trim();
        if (value === '') return;
        try {
          if (typeof api.renameSession === 'function') await api.renameSession(pending.id, value);
        } catch (error) {
          console.warn('[folder-cards] rename failed', error);
          setNotice(t('renameFailed'));
        }
      }, [api, t]);

      const forkSession = useCallback(async sessionId => {
        setFallbackMenu(null);
        try {
          if (typeof api.forkSession === 'function') await api.forkSession(sessionId);
        } catch (error) {
          console.warn('[folder-cards] fork failed', error);
          setNotice(t('forkFailed'));
        }
      }, [api, t]);

      const copySessionId = useCallback(sessionId => {
        setFallbackMenu(null);
        try {
          if (typeof api.copySessionId === 'function') api.copySessionId(sessionId);
        } catch (error) {
          console.warn('[folder-cards] copy failed', error);
        }
      }, [api]);

      const toggleArchive = useCallback(async (sessionId, isArchived) => {
        setFallbackMenu(null);
        try {
          if (isArchived) await api.unarchiveSession(sessionId);
          else if (typeof api.archiveSession === 'function') await api.archiveSession(sessionId);
        } catch (error) {
          console.warn('[folder-cards] archive failed', error);
          setNotice(t('archiveFailed'));
        }
      }, [api, t]);

      const openWorkspaceMenu = useCallback((workspaceId, displayTitle, x, y) => {
        try {
          if (typeof api.openWorkspaceMenu === 'function') api.openWorkspaceMenu(workspaceId, displayTitle, x, y);
        } catch (error) {
          console.warn('[folder-cards] workspace menu failed', error);
        }
      }, [api]);

      const restoreSession = useCallback(sessionId => {
        try {
          if (typeof api.unarchiveSession === 'function') api.unarchiveSession(sessionId);
        } catch (error) {
          console.warn('[folder-cards] unarchive failed', error);
        }
      }, [api]);

      const addWorkspace = useCallback(async () => {
        if (busy) return;
        setBusy(true);
        setNotice('');
        try {
          const path = typeof api.pickDirectory === 'function' ? await api.pickDirectory() : null;
          if (!path) return;
          if (typeof api.createWorkspace === 'function') await api.createWorkspace(path);
        } catch (error) {
          console.warn('[folder-cards] create workspace failed', error);
          setNotice(String(error && error.message || '').indexOf('directory-picker') >= 0
            ? t('pickerUnavailable')
            : t('addFailed'));
        } finally {
          setBusy(false);
        }
      }, [api, busy, t]);

      const pickImage = useCallback((workspaceId) => {
        targetRef.current = workspaceId;
        const input = fileRef.current;
        if (!input) return;
        input.value = '';
        input.click();
      }, []);

      const resetImage = useCallback((workspaceId) => {
        if (!(workspaceId in images)) return;
        const next = { ...images };
        delete next[workspaceId];
        const failure = writeImages(next);
        if (failure !== '') {
          setNotice(t(failure === 'tooLarge' ? 'imageTooLarge' : 'storageFailed'));
          return;
        }
        setImages(next);
      }, [images, t]);

      const onPickFile = useCallback(async (event) => {
        const input = event.target;
        const file = input.files && input.files[0];
        const workspaceId = targetRef.current;
        targetRef.current = null;
        if (!file || !workspaceId) return;
        setBusy(true);
        setNotice('');
        try {
          const dataUrl = await shrinkImage(file, MAX_EDGE);
          const next = { ...images, [workspaceId]: dataUrl };
          const failure = writeImages(next);
          if (failure !== '') {
            setNotice(t(failure === 'tooLarge' ? 'imageTooLarge' : 'storageFailed'));
            return;
          }
          setImages(next);
        } catch (error) {
          console.warn('[folder-cards] image rejected', error);
          setNotice(t('imageFailed'));
        } finally {
          setBusy(false);
          input.value = '';
        }
      }, [images, t]);

      const enterFolder = useCallback((workspaceId) => {
        lastOpened.current = workspaceId;
        setOpenId(workspaceId);
      }, []);

      /* A droplet ripple marks the level change: it expands on the way in and
         collapses back into the point on the way out; the other level
         surfaces while the rings are still moving. */
      const [pulse, setPulse] = useState(null);
      const pulseTimers = useRef([]);

      useEffect(() => () => {
        for (const timer of pulseTimers.current) clearTimeout(timer);
        pulseTimers.current = [];
      }, []);

      const startPulse = useCallback((clientX, clientY, mode) => {
        const element = rootRef.current;
        if (!element) return false;
        if (typeof window.matchMedia === 'function'
          && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
        const rect = element.getBoundingClientRect();
        if (!(rect.width > 0) || !(rect.height > 0)) return false;
        for (const timer of pulseTimers.current) clearTimeout(timer);
        pulseTimers.current = [];
        setPulse({
          key: Date.now() + '-' + Math.random(),
          x: Math.max(0, Math.min(rect.width, clientX - rect.left)),
          y: Math.max(0, Math.min(rect.height, clientY - rect.top)),
          mode: mode === 'out' ? 'out' : 'in',
        });
        pulseTimers.current.push(setTimeout(() => setPulse(null), 1000));
        return true;
      }, []);

      const openCard = useCallback((workspaceId, clientX, clientY) => {
        const animated = startPulse(clientX, clientY, 'in');
        lastOpened.current = workspaceId;
        if (!animated) {
          setOpenId(workspaceId);
          return;
        }
        pulseTimers.current.push(setTimeout(() => setOpenId(workspaceId), 150));
      }, [startPulse]);

      const leaveFolder = useCallback((clientX, clientY) => {
        const animated = startPulse(clientX, clientY, 'out');
        if (!animated) {
          setOpenId(null);
          return;
        }
        pulseTimers.current.push(setTimeout(() => setOpenId(null), 160));
      }, [startPulse]);

      const pickSearchResult = useCallback(row => {
        if (row.type === 'workspace') {
          enterFolder(row.id);
        } else if (!row.archived) {
          openSession(row.id);
        } else {
          return;
        }
        setQuery('');
        setSearchOpen(false);
      }, [enterFolder, openSession]);

      const styleNode = h('style', null, CSS);
      const statusText = notice !== '' ? notice : (busy ? t('processing') : '');
      const loading = items.length === 0
        && (workspaceState.phase === 'pending' || workspaceState.state === 'loading');
      const failed = items.length === 0 && workspaceState.state === 'error';

      /* Cards in the chosen order: registry order, or most recently used folder
         first (a folder without sessions keeps the lowest rank). */
      const cardSpecs = useMemo(() => {
        const lastActivity = item => {
          let latest = 0;
          for (const id of Array.isArray(item.sessionIds) ? item.sessionIds : []) {
            const summary = byId[id];
            if (!summary) continue;
            const stamp = Number(summary.updatedAt) || 0;
            if (stamp > latest) latest = stamp;
          }
          return latest;
        };
        const specs = items.map(item => ({
          id: item.workspaceId,
          title: workspaceTitle(item, t),
          image: images[item.workspaceId] || '',
          lastActivity: lastActivity(item),
        }));
        if (sort === 'recent') specs.sort((left, right) => right.lastActivity - left.lastActivity);
        if (ungrouped.length > 0) {
          specs.push({ id: UNGROUPED_KEY, title: t('ungrouped'), image: images[UNGROUPED_KEY] || '', lastActivity: 0 });
        }
        return specs;
      }, [items, images, sort, ungrouped, byId, t]);

      if (!wide) {
        return h('div', { className: 'dsh-fc-root dsh-fc-rail', role: 'group', 'aria-label': t('workspaces') },
          styleNode,
          statusText === '' ? null : h('div', { className: 'dsh-fc-notice', role: 'status' }, statusText),
          cardSpecs.map(spec => h('button', {
            key: spec.id,
            type: 'button',
            className: 'dsh-fc-railBtn',
            title: spec.title,
            'aria-label': spec.title,
            onClick: () => {
              enterFolder(spec.id);
              if (typeof props.expandSidebar === 'function') props.expandSidebar();
            },
          }, spec.image ? h('img', { src: spec.image, alt: '', draggable: false }) : folderGlyph())),
        );
      }

      const cardNodes = cardSpecs.map(spec => {
        const hasImage = spec.image !== '';
        return h('div', { key: spec.id, className: 'dsh-fc-cardWrap' },
          h('button', {
            type: 'button',
            ref: element => {
              if (element) cardRefs.current.set(spec.id, element);
              else cardRefs.current.delete(spec.id);
            },
            className: 'dsh-fc-card' + (hasImage ? ' has-image' : ''),
            title: spec.title,
            'aria-label': spec.title,
            onClick: event => {
              const rect = event.currentTarget.getBoundingClientRect();
              const x = event.clientX > 0 ? event.clientX : rect.left + rect.width / 2;
              const y = event.clientY > 0 ? event.clientY : rect.top + rect.height / 2;
              openCard(spec.id, x, y);
            },
            onContextMenu: event => {
              if (spec.id === UNGROUPED_KEY) return;
              event.preventDefault();
              const rect = event.currentTarget.getBoundingClientRect();
              openWorkspaceMenu(spec.id, spec.title,
                event.clientX > 0 ? event.clientX : rect.left,
                event.clientY > 0 ? event.clientY : rect.bottom);
            },
          },
          hasImage
            ? h('img', { className: 'dsh-fc-img', src: spec.image, alt: '', draggable: false })
            : h('span', { className: 'dsh-fc-glyph' }, folderGlyph()),
          h('span', { className: 'dsh-fc-name' }, spec.title),
          ),
          h('div', { className: 'dsh-fc-tools' },
            h('button', {
              type: 'button',
              className: 'dsh-fc-tool',
              title: t('changeImage'),
              'aria-label': t('changeImage'),
              onClick: () => pickImage(spec.id),
            }, iconImage()),
            hasImage
              ? h('button', {
                  type: 'button',
                  className: 'dsh-fc-tool',
                  title: t('resetImage'),
                  'aria-label': t('resetImage'),
                  onClick: () => resetImage(spec.id),
                }, iconReset())
              : null,
          ),
        );
      });

      const gridNode = failed
        ? h('div', { className: 'dsh-fc-empty', role: 'status' }, t('loadFailed'))
        : loading
          ? h('div', { className: 'dsh-fc-empty', role: 'status' }, t('loading'))
          : items.length === 0
            ? h('div', { className: 'dsh-fc-empty' }, t('noFolders'))
            : h('div', { className: 'dsh-fc-grid' }, cardNodes);

      const searchNode = h('div', { className: 'dsh-fc-results' },
        searchResults.length === 0
          ? h('div', { className: 'dsh-fc-empty', role: 'status' },
              remoteSearch.query === query.trim() && remoteSearch.status === 'loading' ? t('searching') : t('noMatch'))
          : searchResults.map(row => h('button', {
              key: row.key,
              type: 'button',
              className: 'dsh-fc-result'
                + (row.type === 'workspace' ? ' is-workspace' : '')
                + (row.archived ? ' is-archived' : ''),
              title: row.title,
              disabled: row.type === 'session' && row.archived === true,
              onClick: () => pickSearchResult(row),
            },
            h('span', { className: 'dsh-fc-resultTitle' }, row.title),
            h('span', { className: 'dsh-fc-resultMeta' }, row.meta),
            )),
      );

      const viewNode = viewOpen ? [
        h('div', {
          key: 'backdrop',
          className: 'dsh-fc-backdrop',
          onPointerDown: () => setViewOpen(false),
        }),
        h('div', {
          key: 'menu',
          className: 'dsh-fc-viewMenu',
          ref: viewMenuRef,
          role: 'dialog',
          'aria-label': t('viewOptions'),
        },
        h('div', { className: 'dsh-fc-viewLabel' }, t('sortBy')),
        h('div', { className: 'dsh-fc-seg' },
          h('button', {
            type: 'button',
            className: 'dsh-fc-segBtn' + (sort === 'manual' ? ' is-active' : ''),
            onClick: () => setSort('manual'),
          }, t('sortManual')),
          h('button', {
            type: 'button',
            className: 'dsh-fc-segBtn' + (sort === 'recent' ? ' is-active' : ''),
            onClick: () => setSort('recent'),
          }, t('sortRecent')),
        ),
        ),
      ] : null;

      const fallbackNode = fallbackMenu === null ? null : [
        h('div', {
          key: 'backdrop',
          className: 'dsh-fc-backdrop',
          onPointerDown: () => setFallbackMenu(null),
        }),
        h('div', {
          key: 'menu',
          className: 'dsh-fc-fallback',
          ref: fallbackRef,
          role: 'menu',
          style: { left: fallbackMenu.x + 'px', top: fallbackMenu.y + 'px' },
        },
        h('button', { type: 'button', role: 'menuitem', className: 'dsh-fc-fallbackItem', onClick: () => beginRename(fallbackMenu.id, fallbackMenu.title) }, t('rename')),
        h('button', { type: 'button', role: 'menuitem', className: 'dsh-fc-fallbackItem', onClick: () => forkSession(fallbackMenu.id) }, t('fork')),
        h('button', { type: 'button', role: 'menuitem', className: 'dsh-fc-fallbackItem', onClick: () => copySessionId(fallbackMenu.id) }, t('copyId')),
        h('button', {
          type: 'button',
          role: 'menuitem',
          className: 'dsh-fc-fallbackItem',
          onClick: () => toggleArchive(fallbackMenu.id, archivedIds.includes(fallbackMenu.id)),
        }, t(archivedIds.includes(fallbackMenu.id) ? 'unarchive' : 'archive')),
        ),
      ];

      const sessionRow = row => {
        if (renaming !== null && renaming.id === row.id) {
          return h('div', { key: row.id, className: 'dsh-fc-rowWrap' },
            h('input', {
              className: 'dsh-fc-rename',
              value: renaming.value,
              autoFocus: true,
              'aria-label': t('rename'),
              onChange: event => {
                const value = event.target.value;
                renamePending.current = { id: row.id, value };
                setRenaming({ id: row.id, value });
              },
              onKeyDown: event => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitRename();
                } else if (event.key === 'Escape') {
                  event.preventDefault();
                  renamePending.current = null;
                  setRenaming(null);
                }
              },
              onBlur: () => commitRename(),
            }),
          );
        }
        return h('div', { key: row.id, className: 'dsh-fc-rowWrap' },
          h('button', {
            type: 'button',
            className: 'dsh-fc-row' + (row.current ? ' is-current' : ''),
            title: row.title,
            'aria-label': row.running ? `${row.title} · ${t('running')}` : row.title,
            onClick: () => openSession(row.id),
            onContextMenu: event => {
              event.preventDefault();
              const rect = event.currentTarget.getBoundingClientRect();
              openSessionMenu(row.id, row.title,
                event.clientX > 0 ? event.clientX : rect.left + 12,
                event.clientY > 0 ? event.clientY : rect.bottom);
            },
          },
          h('span', {
            className: 'dsh-fc-dot' + (row.running ? ' is-running' : ''),
            title: row.running ? t('running') : null,
            'aria-hidden': true,
          }),
          h('span', { className: 'dsh-fc-rowTitle' }, row.title),
          h('span', { className: 'dsh-fc-rowTime' }, timeLabel(row.updatedAt, now, t)),
          ),
          h('button', {
            type: 'button',
            className: 'dsh-fc-rowMenuBtn',
            title: t('sessionMenu'),
            'aria-label': t('sessionMenu'),
            onClick: event => {
              event.stopPropagation();
              const rect = event.currentTarget.getBoundingClientRect();
              openSessionMenu(row.id, row.title, rect.left, rect.bottom);
            },
          }, iconMore()),
        );
      };

      const archivedNode = openWorkspace === null || archivedSessions.length === 0 ? null
        : [
            h('button', {
              key: 'archived-toggle',
              type: 'button',
              className: 'dsh-fc-row dsh-fc-archivedToggle',
              onClick: () => setShowArchived(value => !value),
            }, h('span', { className: 'dsh-fc-rowTitle' },
              t(showArchived ? 'hideArchived' : 'showArchived', { n: archivedSessions.length }))),
            showArchived
              ? archivedSessions.map(row => h('div', { key: 'archived:' + row.id, className: 'dsh-fc-rowWrap' },
                  h('button', {
                    type: 'button',
                    className: 'dsh-fc-row is-archived',
                    title: row.title,
                    onClick: () => restoreSession(row.id),
                  },
                  h('span', { className: 'dsh-fc-rowTitle' }, row.title),
                  h('span', { className: 'dsh-fc-rowTime' }, t('restore')),
                  )))
              : null,
          ];

      const sessionPanel = openWorkspace === null ? null : h('div', { className: 'dsh-fc-panel' },
        h('div', { className: 'dsh-fc-panelHead' },
          h('button', {
            type: 'button',
            ref: backRef,
            className: 'dsh-fc-back',
            title: t('back'),
            onClick: event => {
              const rect = event.currentTarget.getBoundingClientRect();
              const x = event.clientX > 0 ? event.clientX : rect.left + rect.width / 2;
              const y = event.clientY > 0 ? event.clientY : rect.top + rect.height / 2;
              leaveFolder(x, y);
            },
          }, iconChevronLeft(), h('span', null, t('back'))),
          h('span', {
            className: 'dsh-fc-panelTitle',
            title: workspaceTitle(openWorkspace, t),
          }, workspaceTitle(openWorkspace, t)),
        ),
        h(ScrollRegion, { label: workspaceTitle(openWorkspace, t), bindScroller },
          h('div', { className: 'dsh-fc-rows' },
            openWorkspace.ungrouped
              ? null
              : h('button', {
                  type: 'button',
                  className: 'dsh-fc-row is-new',
                  onClick: () => startSession(openWorkspace.workspaceId),
                }, h('span', { className: 'dsh-fc-rowTitle' }, t('newSession'))),
            sessions.length === 0
              ? h('div', { className: 'dsh-fc-empty' }, t('empty'))
              : sessions.map(sessionRow),
            archivedNode,
          ),
        ),
      );

      return h('div', {
        className: 'dsh-fc-root is-wide',
        ref: rootRef,
        style: availHeight === null ? undefined : { height: availHeight + 'px' },
      },
        styleNode,
        h('div', { className: 'dsh-fc-head' },
          searchOpen
            ? h('input', {
                ref: searchInputRef,
                className: 'dsh-fc-search',
                type: 'text',
                value: query,
                placeholder: t('searchPlaceholder'),
                'aria-label': t('search'),
                spellCheck: false,
                onChange: event => setQuery(event.target.value),
                onKeyDown: event => {
                  if (event.key === 'Escape') {
                    event.preventDefault();
                    setQuery('');
                    setSearchOpen(false);
                  }
                },
              })
            : h('span', { className: 'dsh-fc-headTitle' }, t('workspaces')),
          searchOpen
            ? h('button', {
                type: 'button',
                className: 'dsh-fc-iconbtn',
                title: t('clearSearch'),
                'aria-label': t('clearSearch'),
                onClick: () => { setQuery(''); setSearchOpen(false); },
              }, iconClose())
            : h('button', {
                type: 'button',
                className: 'dsh-fc-iconbtn',
                title: t('search'),
                'aria-label': t('search'),
                onClick: () => { setSearchOpen(true); setQuery(''); },
              }, iconSearch()),
          h('button', {
            type: 'button',
            ref: viewButtonRef,
            className: 'dsh-fc-iconbtn',
            title: t('viewOptions'),
            'aria-label': t('viewOptions'),
            'aria-expanded': viewOpen ? 'true' : 'false',
            onClick: () => setViewOpen(value => !value),
          }, iconSliders()),
          h('button', {
            type: 'button',
            className: 'dsh-fc-iconbtn',
            title: t('addWorkspace'),
            'aria-label': t('addWorkspace'),
            disabled: busy,
            onClick: addWorkspace,
          }, iconPlus()),
        ),
        viewNode,
        statusText === '' ? null : h('div', { className: 'dsh-fc-notice', role: 'status' }, statusText),
        h('div', { className: 'dsh-fc-body' },
          query.trim() !== ''
            ? h(ScrollRegion, { label: t('search'), bindScroller }, searchNode)
            : sessionPanel !== null
              ? sessionPanel
              : h(ScrollRegion, { label: t('workspaces'), bindScroller }, gridNode),
        ),
        fallbackNode,
        pulse === null ? null : h('div', { className: 'dsh-fc-pulse', 'aria-hidden': true },
          h('span', { key: pulse.key + ':core', className: 'dsh-fc-ripple is-core' + (pulse.mode === 'out' ? ' is-reverse' : ''), style: { left: pulse.x + 'px', top: pulse.y + 'px' } }),
          h('span', { key: pulse.key + ':ring-1', className: 'dsh-fc-ripple' + (pulse.mode === 'out' ? ' is-reverse' : ''), style: { left: pulse.x + 'px', top: pulse.y + 'px' } }),
          h('span', { key: pulse.key + ':ring-2', className: 'dsh-fc-ripple is-late' + (pulse.mode === 'out' ? ' is-reverse' : ''), style: { left: pulse.x + 'px', top: pulse.y + 'px' } }),
        ),
        h('input', {
          ref: fileRef,
          type: 'file',
          accept: 'image/*',
          className: 'dsh-fc-file',
          tabIndex: -1,
          'aria-hidden': true,
          onChange: onPickFile,
        }),
      );
    }

/**
 * Client entry: locale dictionaries, the service-facing api object, and the slot registration.
 *
 * This file is a fragment of the single client bundle. build.mjs concatenates
 * the sections in name order inside the factory closure, so declarations are
 * shared across files and no import statements are needed.
 */
    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        let translate = key => key;
        try {
          const locale = ctx.get('locale');
          if (locale && typeof locale.register === 'function') {
            ctx.effect(() => locale.register(NS, { zh, en }), 'folder-cards: dictionaries');
          }
          if (locale && typeof locale.bind === 'function') translate = locale.bind(NS);
        } catch (error) {
          console.warn('[folder-cards] locale unavailable', error);
        }

        const api = {
          t: (key, params) => {
            try {
              const value = translate(key, params);
              return typeof value === 'string' && value !== '' ? value : (zh[key] || key);
            } catch (error) {
              return zh[key] || key;
            }
          },
          open(sessionId) {
            const service = ctx.get('uiWorkspace');
            if (service && typeof service.openSession === 'function') service.openSession(sessionId);
          },
          startSession(workspaceId) {
            const service = ctx.get('uiWorkspace');
            if (service && typeof service.startSession === 'function') service.startSession(workspaceId);
          },
          async pickDirectory() {
            const service = ctx.get('uiWorkspace');
            if (service && typeof service.pickDirectory === 'function') return service.pickDirectory();
            return null;
          },
          async createWorkspace(path) {
            const service = ctx.get('workspaces');
            if (service && typeof service.create === 'function') return service.create({ path });
            return null;
          },
          async searchSessions(text, signal) {
            const service = ctx.get('sessions');
            if (!service || typeof service.search !== 'function') return [];
            const result = await service.search(text, signal);
            if (result && result.ok === true && result.value) {
              return Array.isArray(result.value.items) ? result.value.items : [];
            }
            return [];
          },
          openSessionMenu(sessionId, displayTitle, x, y) {
            const menus = ctx.get('contextMenus');
            if (!menus || typeof menus.open !== 'function') return;
            menus.open({ kind: 'session', value: { sessionId, displayTitle } }, { x, y });
          },
          openWorkspaceMenu(workspaceId, displayTitle, x, y) {
            const menus = ctx.get('contextMenus');
            if (!menus || typeof menus.open !== 'function') return;
            menus.open({ kind: 'workspace', value: { workspaceId, displayTitle } }, { x, y });
          },
          async unarchiveSession(sessionId) {
            const service = ctx.get('uiWorkspace');
            if (service && typeof service.unarchiveSession === 'function') return service.unarchiveSession(sessionId);
            const workspaces = ctx.get('workspaces');
            if (workspaces && typeof workspaces.unarchiveSession === 'function') return workspaces.unarchiveSession(sessionId);
            return null;
          },
          sessionMenuAvailable() {
            let menus;
            try {
              menus = ctx.get('contextMenus');
            } catch (error) {
              return false;
            }
            if (!menus || typeof menus.open !== 'function') return false;
            try {
              const source = menus.registeredKinds;
              const kinds = source && typeof source.getSnapshot === 'function' ? source.getSnapshot() : null;
              if (Array.isArray(kinds)) return kinds.indexOf('session') >= 0;
              return true;
            } catch (error) {
              return true;
            }
          },
          async renameSession(sessionId, title) {
            const sessions = ctx.get('sessions');
            if (!sessions || typeof sessions.using !== 'function') throw new Error('sessions service unavailable');
            const result = await sessions.using(
              sessionId,
              { source: 'workspaceOperation' },
              reference => reference.binding.session.rename(title),
            );
            if (result && result.ok === false) throw new Error((result.error && result.error.message) || 'rename failed');
            return result;
          },
          async forkSession(sessionId) {
            const sessions = ctx.get('sessions');
            if (!sessions || typeof sessions.fork !== 'function') throw new Error('sessions service unavailable');
            return sessions.fork({ sessionId });
          },
          async archiveSession(sessionId) {
            const service = ctx.get('uiWorkspace');
            if (!service || typeof service.archiveSession !== 'function') throw new Error('archive unavailable');
            return service.archiveSession(sessionId);
          },
          copySessionId(sessionId) {
            try {
              if (typeof navigator !== 'undefined' && navigator.clipboard
                && typeof navigator.clipboard.writeText === 'function') {
                navigator.clipboard.writeText(sessionId).catch(() => {});
              }
            } catch (error) {
              /* Clipboard access can be denied; the action stays harmless. */
            }
          },
        };

        ctx.effect(() => ctx.slots.inject('sidebar.workspaces', () => ctx.slots.register({
          name: 'sidebar.workspaces',
          priority: -1,
          locale: NS,
          inject: () => ({ api }),
        }, FolderCards)), 'folder-cards: sidebar section');
      },
    };
  },
});
