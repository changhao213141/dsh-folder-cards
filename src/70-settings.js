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
