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
