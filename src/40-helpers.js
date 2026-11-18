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

