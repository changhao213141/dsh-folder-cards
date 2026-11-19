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
        }, h(FolderCardsSettings, { settings: settingsStore, t, compact: true })),
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

