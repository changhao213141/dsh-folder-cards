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
