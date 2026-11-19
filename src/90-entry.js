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

        const history = createHistoryStore();

        ctx.effect(() => ctx.slots.inject('sidebar.workspaces', () => ctx.slots.register({
          name: 'sidebar.workspaces',
          priority: -1,
          locale: NS,
          inject: () => ({ api, history }),
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
      },
    };
