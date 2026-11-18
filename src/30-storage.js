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

