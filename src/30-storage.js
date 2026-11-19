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
