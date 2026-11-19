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
      needsYou: '需要你处理',
      finishedUnread: '有新的运行结果',
      otherFoldersPending: '{n} 个待处理',
      otherFoldersDone: '{n} 个已完成',
      backToConversation: '返回上一个会话',
      workingHere: '正在这里干活',
      dingDone: '叮，完成了！',
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
      settingsTitle: '文件夹卡片',
      settingsGroupMotion: '动效',
      motionWiggle: '当前文件夹抖动',
      motionWiggleHint: '你正在干活的文件夹轻轻抖一下；关掉后只保留品牌色边框',
      motionMarquee: '运行中文字滚动',
      motionMarqueeHint: '有会话在跑时，卡片底部滚动显示「正在这里干活」',
      motionCelebrate: '完成气泡',
      motionCelebrateHint: '会话跑完时在卡片上弹出「叮，完成了！」',
      motionRipple: '点击水波',
      motionRippleHint: '进出文件夹时的水波扩散与回收动画',
      settingsGroupBehavior: '行为',
      rememberFolder: '记住上次打开的文件夹',
      rememberFolderHint: '下次打开 DSH 直接回到这个文件夹',
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
      needsYou: 'Needs your approval or answer',
      finishedUnread: 'New run finished',
      otherFoldersPending: '{n} pending',
      otherFoldersDone: '{n} done',
      backToConversation: 'Back to previous conversation',
      workingHere: 'Working here',
      dingDone: 'Ding — done!',
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
      settingsTitle: 'Folder cards',
      settingsGroupMotion: 'Motion',
      motionWiggle: 'Wiggle the current folder',
      motionWiggleHint: 'The folder you are working in rocks slightly; off keeps only the brand border',
      motionMarquee: 'Scroll the running label',
      motionMarqueeHint: 'While a conversation runs, the card bottom scrolls "Working here"',
      motionCelebrate: 'Finished bubble',
      motionCelebrateHint: 'Pops "Ding — done!" on the card when a run finishes',
      motionRipple: 'Click ripple',
      motionRippleHint: 'The droplet ripple on the way in and out of a folder',
      settingsGroupBehavior: 'Behaviour',
      rememberFolder: 'Reopen the last folder',
      rememberFolderHint: 'Go straight back to that folder the next time DSH opens',
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

/**
 * Browser-local persistence: per-folder card artwork and the settings blob
 * (sort order, the folder to reopen, and the motion switches).
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

    /** Settings blob: order, the folder to reopen, and the motion switches. */
    const PREFS_KEY = 'dsh.folderCards.prefs.v1';

    /** Motion is on by default; users switch individual effects off in Settings. */
    const DEFAULT_MOTION = { wiggle: true, marquee: true, celebrate: true, ripple: true };

    function normalizeMotion(value) {
      const source = value && typeof value === 'object' ? value : {};
      const motion = {};
      for (const key of Object.keys(DEFAULT_MOTION)) {
        motion[key] = typeof source[key] === 'boolean' ? source[key] : DEFAULT_MOTION[key];
      }
      return motion;
    }

    function readPrefs() {
      try {
        const raw = window.localStorage.getItem(PREFS_KEY);
        if (!raw) {
          return { sort: 'manual', lastOpenId: null, rememberFolder: true, motion: normalizeMotion(null) };
        }
        const parsed = JSON.parse(raw);
        return {
          sort: parsed && parsed.sort === 'recent' ? 'recent' : 'manual',
          lastOpenId: parsed && typeof parsed.lastOpenId === 'string' && parsed.lastOpenId !== ''
            ? parsed.lastOpenId
            : null,
          rememberFolder: !parsed || parsed.rememberFolder !== false,
          motion: normalizeMotion(parsed && parsed.motion),
        };
      } catch (error) {
        return { sort: 'manual', lastOpenId: null, rememberFolder: true, motion: normalizeMotion(null) };
      }
    }

    function writePrefs(prefs) {
      try {
        window.localStorage.setItem(PREFS_KEY, JSON.stringify({ version: 2, ...prefs }));
        return true;
      } catch (error) {
        return false;
      }
    }

    /**
     * One observable settings blob shared by the sidebar and the settings page,
     * so changing a switch applies without a reload.
     */
    function createSettingsStore() {
      let state = readPrefs();
      const listeners = new Set();
      const emit = () => {
        for (const listener of listeners) {
          try {
            listener();
          } catch (error) {
            /* a broken listener must not break the others */
          }
        }
      };
      return {
        subscribe(listener) {
          listeners.add(listener);
          return () => { listeners.delete(listener); };
        },
        getSnapshot() {
          return state;
        },
        /** Merge a patch, persist it, and notify both surfaces. */
        update(patch) {
          const next = { ...state, ...patch };
          next.motion = normalizeMotion(next.motion);
          if (next === state) return;
          state = next;
          writePrefs({ sort: state.sort, lastOpenId: state.lastOpenId, rememberFolder: state.rememberFolder, motion: state.motion });
          emit();
        },
      };
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

    /** Status lookup that tolerates a missing or unreadable status map. */
    function sessionStatusOf(statuses, sessionId) {
      try {
        if (statuses && typeof statuses.get === 'function') return statuses.get(sessionId) || null;
      } catch (error) {
        /* treat an unreadable map as no status */
      }
      return null;
    }

    /**
     * What one Session wants from the user: `pending` when it waits for an
     * approval, a plan review or an answer, `done` when a run finished and was
     * never looked at. Mirrors the shipped sidebar's row semantics.
     * @returns 'pending' | 'done' | null
     */
    function sessionAttention(statuses, sessionId) {
      const status = sessionStatusOf(statuses, sessionId);
      if (!status) return null;
      const kind = status.pendingInteraction && status.pendingInteraction.kind;
      if (kind === 'approval' || kind === 'plan-review' || kind === 'question') return 'pending';
      if (status.completionUnread === true) return 'done';
      return null;
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

    function iconGear() {
      return h('svg', { viewBox: '0 0 16 16', width: 14, height: 14, 'aria-hidden': true, focusable: false },
        h('circle', { cx: 8, cy: 8, r: 2.1, fill: 'none', stroke: 'currentColor', strokeWidth: 1.3 }),
        h('path', {
          d: 'M8 1.9v1.6M8 12.5v1.6M1.9 8h1.6M12.5 8h1.6M3.7 3.7l1.1 1.1M11.2 11.2l1.1 1.1M12.3 3.7l-1.1 1.1M4.8 11.2l-1.1 1.1',
          stroke: 'currentColor',
          strokeWidth: 1.3,
          strokeLinecap: 'round',
        }),
      );
    }

    function historyGlyph() {
      return h('svg', { viewBox: '0 0 16 16', width: 13, height: 13, 'aria-hidden': true, focusable: false },
        h('path', { d: 'M6.4 3.6 3 7l3.4 3.4', stroke: 'currentColor', strokeWidth: 1.4, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('path', { d: 'M3.3 7H9a3.6 3.6 0 0 1 3.6 3.6V13', stroke: 'currentColor', strokeWidth: 1.4, fill: 'none', strokeLinecap: 'round' }),
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
 * Cross-slot conversation history: the sidebar records the conversation it
 * leaves behind, and a small chip in the composer tool row offers the way
 * back. Both halves live in this module, so one in-memory store is enough.
 *
 * This file is a fragment of the single client bundle. build.mjs concatenates
 * the sections in name order inside the factory closure, so declarations are
 * shared across files and no import statements are needed.
 */

    /* ---------- conversation history ---------- */

    /** Bounded last-in-first-out stack of conversation ids this plugin opened. */
    function createHistoryStore() {
      const stack = [];
      const listeners = new Set();
      let current = null;
      const LIMIT = 20;
      const emit = () => {
        for (const listener of listeners) {
          try {
            listener();
          } catch (error) {
            /* a broken listener must not break the others */
          }
        }
      };
      const trim = () => {
        while (stack.length > LIMIT) stack.shift();
      };
      return {
        subscribe(listener) {
          listeners.add(listener);
          return () => { listeners.delete(listener); };
        },
        getSnapshot() {
          return { current, stack: stack.slice() };
        },
        /** Remember the conversation the main view is showing. */
        setCurrent(sessionId) {
          if (current === sessionId) return;
          current = sessionId;
          emit();
        },
        /** Record the conversation being left; the current one is never stacked. */
        push(sessionId) {
          if (typeof sessionId !== 'string' || sessionId === '' || sessionId === current) return;
          if (stack[stack.length - 1] === sessionId) return;
          stack.push(sessionId);
          trim();
          emit();
        },
        /** Pop the way back and remember where we came from, so it toggles. */
        take() {
          const target = stack.pop();
          if (target === undefined) return null;
          if (current !== null) {
            stack.push(current);
            trim();
          }
          emit();
          return target;
        },
      };
    }

    const HISTORY_CSS = `
.dsh-fc-historyBtn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0 8px 0 6px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  flex: none;
  max-width: 170px;
}
.dsh-fc-historyBtn:hover {
  background: var(--dsw-alias-bg-layer-2);
  border-color: var(--dsw-alias-border-l2);
  color: var(--dsw-alias-label-primary);
}
.dsh-fc-historyBtn:focus-visible {
  border-color: var(--dsw-alias-brand-primary);
  color: var(--dsw-alias-label-primary);
}
.dsh-fc-historyLabel {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
`;

    /**
     * Way back to the conversation this plugin replaced last.
     * @param props - `history` store plus the `api`/locale seats from this plugin.
     */
    function BackToConversation(props) {
      const history = props.history;
      const api = props.api && typeof props.api === 'object' ? props.api : {};
      const t = key => {
        try {
          if (typeof props.t === 'function') {
            const value = props.t(key);
            if (typeof value === 'string' && value !== '') return value;
          }
          if (typeof api.t === 'function') return api.t(key);
        } catch (error) {
          /* fall back to the key */
        }
        return key;
      };
      const [snapshot, setSnapshot] = useState(() => (
        history && typeof history.getSnapshot === 'function' ? history.getSnapshot() : { current: null, stack: [] }
      ));
      useEffect(() => {
        if (!history || typeof history.subscribe !== 'function') return undefined;
        return history.subscribe(() => setSnapshot(history.getSnapshot()));
      }, [history]);

      const stack = Array.isArray(snapshot.stack) ? snapshot.stack : [];
      if (stack.length === 0) return null;
      const target = stack[stack.length - 1];
      let title = '';
      try {
        title = typeof api.sessionTitle === 'function' ? api.sessionTitle(target) : '';
      } catch (error) {
        title = '';
      }
      const fallback = t('backToConversation');
      const label = typeof title === 'string' && title !== '' ? title : fallback;
      const tooltip = typeof title === 'string' && title !== '' ? `${fallback} · ${title}` : fallback;
      return h(React.Fragment, null,
        h('style', null, HISTORY_CSS),
        h('button', {
          type: 'button',
          className: 'dsh-fc-historyBtn',
          title: tooltip,
          'aria-label': tooltip,
          onClick: () => {
            try {
              const id = typeof history.take === 'function' ? history.take() : null;
              if (id !== null && typeof api.open === 'function') api.open(id);
            } catch (error) {
              console.warn('[folder-cards] go back failed', error);
            }
          },
        }, historyGlyph(), h('span', { className: 'dsh-fc-historyLabel' }, label)),
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

      /* The settings blob is shared with the settings page, so a switch flips
         the sidebar without a reload. */
      const settingsStore = props.settings && typeof props.settings === 'object' ? props.settings : null;
      const [settingsState, setSettingsState] = useState(() => (
        settingsStore && typeof settingsStore.getSnapshot === 'function' ? settingsStore.getSnapshot() : readPrefs()
      ));
      useEffect(() => {
        if (!settingsStore || typeof settingsStore.subscribe !== 'function') return undefined;
        return settingsStore.subscribe(() => setSettingsState(settingsStore.getSnapshot()));
      }, [settingsStore]);
      const motion = settingsState.motion || DEFAULT_MOTION;
      const sort = settingsState.sort;
      const patchSettings = useCallback(patch => {
        if (settingsStore && typeof settingsStore.update === 'function') settingsStore.update(patch);
      }, [settingsStore]);

      const [openId, setOpenId] = useState(() => (settingsState.rememberFolder ? settingsState.lastOpenId : null));
      const [images, setImages] = useState(readImages);
      const [busy, setBusy] = useState(false);
      const [notice, setNotice] = useState('');
      const [now, setNow] = useState(() => Date.now());
      const [query, setQuery] = useState('');
      const [searchOpen, setSearchOpen] = useState(false);
      const [remoteSearch, setRemoteSearch] = useState({ query: '', status: 'idle', items: [] });
      const [showArchived, setShowArchived] = useState(false);
      const [settingsOpen, setSettingsOpen] = useState(false);
      const [fallbackMenu, setFallbackMenu] = useState(null);
      const [renaming, setRenaming] = useState(null);
      const settingsButtonRef = useRef(null);
      const settingsPanelRef = useRef(null);
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
      const geometryWarned = useRef(false);
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
        if (!scroller || scroller === document.body) {
          /* The shell layout changed under us: fall back to the CSS cap
             (100cqh) and say so once, instead of silently mis-sizing. */
          if (!geometryWarned.current) {
            geometryWarned.current = true;
            console.warn('[folder-cards] sidebar scroll viewport not found; falling back to the 100cqh cap.');
          }
          return;
        }
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

      /* Remember the folder to reopen, when the setting asks for it. */
      useEffect(() => {
        if (!settingsStore || typeof settingsStore.update !== 'function') return;
        if (!settingsState.rememberFolder) return;
        if (settingsState.lastOpenId === openId) return;
        settingsStore.update({ lastOpenId: openId });
      }, [openId, settingsState.rememberFolder, settingsState.lastOpenId, settingsStore]);

      /* Dismiss plugin-local popovers on an outside press. */
      useEffect(() => {
        if (!settingsOpen && fallbackMenu === null) return undefined;
        const onDown = event => {
          const target = event.target;
          const inPanel = settingsPanelRef.current && settingsPanelRef.current.contains(target);
          const inButton = settingsButtonRef.current && settingsButtonRef.current.contains(target);
          const inFallback = fallbackRef.current && fallbackRef.current.contains(target);
          if (!inPanel && !inButton && !inFallback) {
            setSettingsOpen(false);
            setFallbackMenu(null);
          }
        };
        document.addEventListener('pointerdown', onDown, true);
        return () => document.removeEventListener('pointerdown', onDown, true);
      }, [settingsOpen, fallbackMenu]);

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

      /* The folder whose conversation the main view is showing right now: the
         one that reads as "the area I am working in". */
      const activeWorkspaceId = useMemo(() => {
        if (currentSessionId === null) return null;
        for (const item of items) {
          if (Array.isArray(item.sessionIds) && item.sessionIds.indexOf(currentSessionId) >= 0) return item.workspaceId;
        }
        return ungrouped.indexOf(currentSessionId) >= 0 ? UNGROUPED_KEY : null;
      }, [currentSessionId, items, ungrouped]);

      /* The composer chip needs the conversation the main view shows, and the
         conversation being left the moment a row is opened. */
      const currentIdRef = useRef(null);
      currentIdRef.current = currentSessionId;
      const history = props.history && typeof props.history === 'object' ? props.history : null;
      useEffect(() => {
        if (history && typeof history.setCurrent === 'function') history.setCurrent(currentSessionId);
      }, [history, currentSessionId]);

      const [historyTarget, setHistoryTarget] = useState(null);
      useEffect(() => {
        if (!history || typeof history.subscribe !== 'function') return undefined;
        const read = () => {
          const snapshot = typeof history.getSnapshot === 'function' ? history.getSnapshot() : null;
          const stack = snapshot && Array.isArray(snapshot.stack) ? snapshot.stack : [];
          setHistoryTarget(stack.length > 0 ? stack[stack.length - 1] : null);
        };
        read();
        return history.subscribe(read);
      }, [history]);

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
            attention: sessionAttention(statuses, id),
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
          if (history && typeof history.push === 'function') history.push(currentIdRef.current);
          if (typeof api.open === 'function') api.open(sessionId);
        } catch (error) {
          console.warn('[folder-cards] open session failed', error);
        }
      }, [api, history]);

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
        const animated = motion.ripple && startPulse(clientX, clientY, 'in');
        lastOpened.current = workspaceId;
        if (!animated) {
          setOpenId(workspaceId);
          return;
        }
        pulseTimers.current.push(setTimeout(() => setOpenId(workspaceId), 150));
      }, [startPulse, motion.ripple]);

      const leaveFolder = useCallback((clientX, clientY) => {
        const animated = motion.ripple && startPulse(clientX, clientY, 'out');
        if (!animated) {
          setOpenId(null);
          return;
        }
        pulseTimers.current.push(setTimeout(() => setOpenId(null), 160));
      }, [startPulse, motion.ripple]);

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

      /* What each folder wants from the user right now: an approval/question,
         or a finished run nobody has opened yet. The strongest state wins, so
         a folder waiting on you never hides behind a "finished" dot. */
      const attention = useMemo(() => {
        const levels = new Map();
        const note = (workspaceId, sessionId) => {
          const level = sessionAttention(statuses, sessionId);
          if (level === null) return;
          if (level === 'pending' || levels.get(workspaceId) !== 'pending') levels.set(workspaceId, level);
        };
        for (const item of items) {
          for (const id of Array.isArray(item.sessionIds) ? item.sessionIds : []) note(item.workspaceId, id);
        }
        for (const id of ungrouped) note(UNGROUPED_KEY, id);
        return levels;
      }, [items, ungrouped, statuses]);

      /* Folders with a conversation running right now: their bottom line says
         what is happening instead of only the folder name. */
      const runningFolders = useMemo(() => {
        const running = new Set();
        const note = (workspaceId, sessionId) => {
          const status = sessionStatusOf(statuses, sessionId);
          if (status && status.running === true) running.add(workspaceId);
        };
        for (const item of items) {
          for (const id of Array.isArray(item.sessionIds) ? item.sessionIds : []) note(item.workspaceId, id);
        }
        for (const id of ungrouped) note(UNGROUPED_KEY, id);
        return running;
      }, [items, ungrouped, statuses]);

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
          attention: attention.get(item.workspaceId) || null,
          running: runningFolders.has(item.workspaceId),
          active: item.workspaceId === activeWorkspaceId,
          lastActivity: lastActivity(item),
        }));
        if (sort === 'recent') specs.sort((left, right) => right.lastActivity - left.lastActivity);
        if (ungrouped.length > 0) {
          specs.push({
            id: UNGROUPED_KEY,
            title: t('ungrouped'),
            image: images[UNGROUPED_KEY] || '',
            attention: attention.get(UNGROUPED_KEY) || null,
            running: runningFolders.has(UNGROUPED_KEY),
            active: activeWorkspaceId === UNGROUPED_KEY,
            lastActivity: 0,
          });
        }
        return specs;
      }, [items, images, sort, ungrouped, byId, attention, runningFolders, activeWorkspaceId, t]);

      /** Accessible name that carries the card's attention state. */
      const cardLabel = spec => {
        const parts = [spec.title];
        if (spec.running || spec.active) parts.push(t('workingHere'));
        if (spec.attention === 'pending') parts.push(t('needsYou'));
        else if (spec.attention === 'done') parts.push(t('finishedUnread'));
        return parts.join(' · ');
      };

      /* While a folder is open its list replaces the grid, so the other
         folders' dots are out of sight. This reminder keeps them visible in
         the header and jumps back to the grid when clicked. */
      const reminders = useMemo(() => {
        const pending = [];
        const done = [];
        for (const spec of cardSpecs) {
          if (spec.attention === null || spec.id === openId) continue;
          if (spec.attention === 'pending') pending.push(spec.title);
          else done.push(spec.title);
        }
        return { pending, done };
      }, [cardSpecs, openId]);

      const reminderTitle = [
        reminders.pending.length === 0 ? '' : `${t('otherFoldersPending', { n: reminders.pending.length })}：${reminders.pending.join(' · ')}`,
        reminders.done.length === 0 ? '' : `${t('otherFoldersDone', { n: reminders.done.length })}：${reminders.done.join(' · ')}`,
      ].filter(Boolean).join('  ');

      const reminderNode = openId === null || searchOpen || (reminders.pending.length === 0 && reminders.done.length === 0)
        ? null
        : h('button', {
            type: 'button',
            className: 'dsh-fc-reminder',
            title: reminderTitle,
            'aria-label': reminderTitle,
            onClick: () => {
              if (query.trim() !== '') {
                setQuery('');
                setSearchOpen(false);
              }
              setOpenId(null);
            },
          },
          reminders.pending.length > 0
            ? h('span', { key: 'pending', className: 'dsh-fc-reminderItem' },
                h('span', { className: 'dsh-fc-reminderDot is-pending' }),
                String(reminders.pending.length))
            : null,
          reminders.done.length > 0
            ? h('span', { key: 'done', className: 'dsh-fc-reminderItem' },
                h('span', { className: 'dsh-fc-reminderDot is-done' }),
                String(reminders.done.length))
            : null,
          );

      /* "叮，完成了！" — a run that finishes while the grid is on screen, or
         one that finished while a folder was open, flashes on its card. The
         queued ones surface the moment the grid comes back. */
      const [flashes, setFlashes] = useState({});
      const flashTimers = useRef([]);
      const levelsRef = useRef(new Map());
      const primedRef = useRef(false);
      const pendingFlashes = useRef(new Set());
      useEffect(() => () => {
        for (const timer of flashTimers.current) clearTimeout(timer);
        flashTimers.current = [];
      }, []);
      useEffect(() => {
        const gridVisible = openId === null && !searchOpen;
        const previous = levelsRef.current;
        const next = new Map();
        const wasPrimed = primedRef.current;
        for (const spec of cardSpecs) {
          if (spec.attention !== null) next.set(spec.id, spec.attention);
          if (wasPrimed && motion.celebrate && spec.attention === 'done' && previous.get(spec.id) !== 'done') {
            pendingFlashes.current.add(spec.id);
          }
        }
        levelsRef.current = next;
        if (items.length > 0) primedRef.current = true;

        if (!motion.celebrate) {
          pendingFlashes.current.clear();
          return;
        }
        if (!gridVisible || pendingFlashes.current.size === 0) return;
        /* Only celebrate what is still unread, so a folder whose conversation
           was already opened during the detour does not pop "ding" at you. */
        const doneNow = new Set();
        for (const spec of cardSpecs) if (spec.attention === 'done') doneNow.add(spec.id);
        const ids = Array.from(pendingFlashes.current).filter(id => doneNow.has(id));
        pendingFlashes.current.clear();
        if (ids.length === 0) return;
        const stamp = Date.now();
        setFlashes(current => {
          const merged = { ...current };
          for (const id of ids) merged[id] = stamp;
          return merged;
        });
        for (const id of ids) {
          flashTimers.current.push(setTimeout(() => {
            setFlashes(current => {
              if (!(id in current)) return current;
              const trimmed = { ...current };
              delete trimmed[id];
              return trimmed;
            });
          }, 2600));
        }
      }, [cardSpecs, openId, searchOpen, items.length, motion.celebrate]);

      const attentionBadge = spec => (spec.attention === null
        ? null
        : h('span', {
            className: 'dsh-fc-badge' + (spec.attention === 'pending' ? ' is-pending' : ' is-done'),
            'aria-hidden': true,
          }));

      /* Same way back, mirrored into the sidebar header so it is reachable
         without looking at the composer. */
      const historyTitle = historyTarget === null || typeof api.sessionTitle !== 'function'
        ? ''
        : (() => {
            try {
              return api.sessionTitle(historyTarget);
            } catch (error) {
              return '';
            }
          })();
      const historyLabel = t('backToConversation');
      const historyNode = historyTarget === null
        ? null
        : h('button', {
            type: 'button',
            className: 'dsh-fc-iconbtn',
            title: historyTitle === '' ? historyLabel : `${historyLabel} · ${historyTitle}`,
            'aria-label': historyTitle === '' ? historyLabel : `${historyLabel} · ${historyTitle}`,
            onClick: () => {
              try {
                const target = typeof history.take === 'function' ? history.take() : null;
                if (target !== null && typeof api.open === 'function') api.open(target);
              } catch (error) {
                console.warn('[folder-cards] go back failed', error);
              }
            },
          }, historyGlyph());

      if (!wide) {
        return h('div', {
          className: 'dsh-fc-root dsh-fc-rail' + (motion.wiggle ? '' : ' no-wiggle')
            + (motion.celebrate ? '' : ' no-celebrate'),
          role: 'group',
          'aria-label': t('workspaces'),
        },
          styleNode,
          statusText === '' ? null : h('div', { className: 'dsh-fc-notice', role: 'status' }, statusText),
          cardSpecs.map(spec => h('button', {
            key: spec.id,
            type: 'button',
            className: 'dsh-fc-railBtn' + (spec.active ? ' is-active' : ''),
            title: cardLabel(spec),
            'aria-label': cardLabel(spec),
            onClick: () => {
              enterFolder(spec.id);
              if (typeof props.expandSidebar === 'function') props.expandSidebar();
            },
          }, spec.image ? h('img', { src: spec.image, alt: '', draggable: false }) : folderGlyph(),
            attentionBadge(spec))),
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
            className: 'dsh-fc-card' + (hasImage ? ' has-image' : '') + (spec.active ? ' is-active' : ''),
            title: cardLabel(spec),
            'aria-label': cardLabel(spec),
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
          spec.running
            ? (motion.marquee
                ? h('span', { className: 'dsh-fc-name is-marquee', 'aria-hidden': true },
                    h('span', { className: 'dsh-fc-nameTrack' },
                      h('span', { className: 'dsh-fc-nameChunk' }, `${spec.title} · ${t('workingHere')}`),
                      h('span', { className: 'dsh-fc-nameChunk' }, `${spec.title} · ${t('workingHere')}`),
                    ))
                : h('span', { className: 'dsh-fc-name' }, `${spec.title} · ${t('workingHere')}`))
            : h('span', { className: 'dsh-fc-name' }, spec.title),
          attentionBadge(spec),
          flashes[spec.id] !== undefined
            ? h('span', { key: flashes[spec.id], className: 'dsh-fc-done' }, t('dingDone'))
            : null,
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

      /* Settings live right here as well: one gear next to the other controls
         opens the same switches the settings page renders. */      const settingsNode = settingsOpen ? [
        h('div', {
          key: 'backdrop',
          className: 'dsh-fc-backdrop',
          onPointerDown: () => setSettingsOpen(false),
        }),
        h('div', {
          key: 'panel',
          className: 'dsh-fc-settingsPop',
          ref: settingsPanelRef,
          role: 'dialog',
          'aria-label': t('settingsTitle'),
        }, h(FolderCardsSettings, { settings: settingsStore, t })),
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
            className: 'dsh-fc-dot'
              + (row.attention === 'pending' ? ' is-pending'
                : row.attention === 'done' ? ' is-done'
                  : row.running ? ' is-running' : ''),
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
        className: 'dsh-fc-root is-wide' + (motion.wiggle ? '' : ' no-wiggle') + (motion.celebrate ? '' : ' no-celebrate'),
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
          reminderNode,
          historyNode,
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
            ref: settingsButtonRef,
            className: 'dsh-fc-iconbtn',
            title: t('settingsTitle'),
            'aria-label': t('settingsTitle'),
            'aria-expanded': settingsOpen ? 'true' : 'false',
            onClick: () => setSettingsOpen(value => !value),
          }, iconGear()),
          h('button', {
            type: 'button',
            className: 'dsh-fc-iconbtn',
            title: t('addWorkspace'),
            'aria-label': t('addWorkspace'),
            disabled: busy,
            onClick: addWorkspace,
          }, iconPlus()),
        ),
        settingsNode,
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
 * The plugin's settings page: the motion switches and two behaviour options,
 * all persisted in the settings blob the sidebar reads.
 *
 * This file is a fragment of the single client bundle. build.mjs concatenates
 * the sections in name order inside the factory closure, so declarations are
 * shared across files and no import statements are needed.
 */

    /* ---------- settings page ---------- */

    const SETTINGS_CSS = `
.dsh-fc-set {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 2px 0 14px 0;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
}
.dsh-fc-setGroup { display: flex; flex-direction: column; gap: 4px; }
.dsh-fc-setGroupTitle {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--dsw-alias-label-secondary);
  padding-bottom: 2px;
}
.dsh-fc-setRow {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 6px 0;
  border-top: 1px solid var(--dsw-alias-border-l1);
}
.dsh-fc-setRow:first-of-type { border-top: 0; }
.dsh-fc-setText { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.dsh-fc-setLabel { font-size: 13px; line-height: 18px; }
.dsh-fc-setHint { font-size: 11px; line-height: 15px; color: var(--dsw-alias-label-secondary); }
.dsh-fc-switch {
  position: relative;
  flex: none;
  width: 34px;
  height: 20px;
  margin-top: 2px;
  padding: 0;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  background: var(--dsw-alias-bg-layer-2);
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;
}
.dsh-fc-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--dsw-alias-label-secondary);
  transition: transform 120ms ease, background 120ms ease;
}
.dsh-fc-switch[aria-checked="true"] {
  background: var(--dsw-alias-brand-primary);
  border-color: var(--dsw-alias-brand-primary);
}
.dsh-fc-switch[aria-checked="true"]::after {
  transform: translateX(14px);
  background: var(--dsw-alias-bg-base);
}
.dsh-fc-switch:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}
.dsh-fc-setSeg { display: flex; gap: 6px; flex: none; }
.dsh-fc-setSegBtn {
  height: 26px;
  padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.dsh-fc-setSegBtn.is-active {
  border-color: var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
}
@media (prefers-reduced-motion: reduce) {
  .dsh-fc-switch, .dsh-fc-switch::after { transition: none; }
}
`;

    /**
     * Settings page row for the plugin's Preferences section.
     * @param props - the settings store plus the plugin's locale seat.
     */
    function FolderCardsSettings(props) {
      const store = props.settings && typeof props.settings === 'object' ? props.settings : null;
      const t = key => {
        try {
          const value = typeof props.t === 'function' ? props.t(key) : key;
          return typeof value === 'string' && value !== '' ? value : key;
        } catch (error) {
          return key;
        }
      };
      const [state, setState] = useState(() => (
        store && typeof store.getSnapshot === 'function' ? store.getSnapshot() : readPrefs()
      ));
      useEffect(() => {
        if (!store || typeof store.subscribe !== 'function') return undefined;
        return store.subscribe(() => setState(store.getSnapshot()));
      }, [store]);

      const motion = state.motion || DEFAULT_MOTION;
      const update = patch => {
        if (store && typeof store.update === 'function') store.update(patch);
      };
      const toggleMotion = key => update({ motion: { ...motion, [key]: !motion[key] } });

      const switchRow = (label, hint, checked, onToggle) => h('div', { className: 'dsh-fc-setRow', key: label },
        h('div', { className: 'dsh-fc-setText' },
          h('span', { className: 'dsh-fc-setLabel' }, label),
          h('span', { className: 'dsh-fc-setHint' }, hint)),
        h('button', {
          type: 'button',
          role: 'switch',
          className: 'dsh-fc-switch',
          'aria-checked': checked ? 'true' : 'false',
          'aria-label': label,
          onClick: onToggle,
        }));

      const segRow = (label, options) => h('div', { className: 'dsh-fc-setRow', key: label },
        h('div', { className: 'dsh-fc-setText' },
          h('span', { className: 'dsh-fc-setLabel' }, label)),
        h('div', { className: 'dsh-fc-setSeg' },
          options.map(option => h('button', {
            key: option.value,
            type: 'button',
            className: 'dsh-fc-setSegBtn' + (option.active ? ' is-active' : ''),
            'aria-pressed': option.active ? 'true' : 'false',
            onClick: option.onSelect,
          }, option.label))));

      return h('div', { className: 'dsh-fc-set' },
        h('style', null, SETTINGS_CSS),
        h('div', { className: 'dsh-fc-setGroup' },
          h('div', { className: 'dsh-fc-setGroupTitle' }, t('settingsGroupMotion')),
          switchRow(t('motionWiggle'), t('motionWiggleHint'), motion.wiggle, () => toggleMotion('wiggle')),
          switchRow(t('motionMarquee'), t('motionMarqueeHint'), motion.marquee, () => toggleMotion('marquee')),
          switchRow(t('motionCelebrate'), t('motionCelebrateHint'), motion.celebrate, () => toggleMotion('celebrate')),
          switchRow(t('motionRipple'), t('motionRippleHint'), motion.ripple, () => toggleMotion('ripple'))),
        h('div', { className: 'dsh-fc-setGroup' },
          h('div', { className: 'dsh-fc-setGroupTitle' }, t('settingsGroupBehavior')),
          switchRow(t('rememberFolder'), t('rememberFolderHint'), state.rememberFolder !== false,
            () => update({ rememberFolder: state.rememberFolder === false })),
          segRow(t('sortBy'), [
            { value: 'manual', label: t('sortManual'), active: state.sort !== 'recent', onSelect: () => update({ sort: 'manual' }) },
            { value: 'recent', label: t('sortRecent'), active: state.sort === 'recent', onSelect: () => update({ sort: 'recent' }) },
          ])),
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
          sessionTitle(sessionId) {
            try {
              const sessions = ctx.get('sessions');
              const list = sessions && sessions.list && typeof sessions.list.getSnapshot === 'function'
                ? sessions.list.getSnapshot()
                : null;
              const summary = list && list.byId ? list.byId[sessionId] : null;
              return summary && typeof summary.title === 'string' ? summary.title.trim() : '';
            } catch (error) {
              return '';
            }
          },
        };

        const history = createHistoryStore();
        const settings = createSettingsStore();

        ctx.effect(() => ctx.slots.inject('sidebar.workspaces', () => ctx.slots.register({
          name: 'sidebar.workspaces',
          priority: -1,
          locale: NS,
          inject: () => ({ api, history, settings }),
        }, FolderCards)), 'folder-cards: sidebar section');

        /* The way back sits in the composer tool row, next to the controls the
           user already looks at while typing. */
        ctx.effect(() => ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
          name: 'conversation.input.left',
          id: 'folder-cards-history',
          order: 10,
          locale: NS,
          inject: () => ({ api, history }),
        }, BackToConversation)), 'folder-cards: composer history chip');

        /* Settings → Plugins → 文件夹卡片: motion switches and behaviour. */
        ctx.effect(() => ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: 'folder-cards',
          order: 40,
          label: () => translate('settingsTitle'),
          locale: NS,
          inject: () => ({ settings }),
        }, FolderCardsSettings)), 'folder-cards: settings page');
      },
    };
  },
});
