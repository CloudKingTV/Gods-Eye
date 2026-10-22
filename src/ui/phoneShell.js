import { msg, t } from '../i18n/index.js';

/**
 * Phone layout. Below this width the desktop rails, the HUD corners and the
 * command dock all fight for the same few hundred pixels, so a bottom tab bar
 * takes over: each tab opens ONE panel as a sheet above the bar, and every
 * other panel in the rails is hidden until its tab is chosen.
 *
 * The panels keep their own disclosure logic: a tab opens or closes its panel
 * by clicking the panel's existing collapse (or dock) toggle, so saved state,
 * share links and every panel's own open/close side effects behave exactly as
 * they do on desktop. A panel the app opens by itself (a fire handing off to
 * a camera, say) brings its tab forward; collapsing the shown panel from its
 * own header closes the sheet.
 */
export const PHONE_SHELL_QUERY = '(max-width: 720px)';

const RAIL_IDS = ['left-panel-stack', 'right-context-rail'];

/**
 * Tabs in bar order. `panels` are rail children shown together on the sheet
 * (the first is the one the tab opens; the rest are the contextual panels the
 * app reveals for that feature). `dock` tabs open a command-dock tray instead.
 */
export const PHONE_TABS = Object.freeze([
  { id: 'search', label: msg('Search'), icon: 'search', dock: 'location-bar' },
  {
    id: 'layers',
    label: msg('Layers'),
    icon: 'layers',
    panels: ['data-panel', 'weather-panel', 'recent-imagery-panel'],
  },
  {
    id: 'context',
    label: msg('Context'),
    icon: 'radar',
    panels: ['global-context-panel', 'radio-panel'],
  },
  {
    id: 'cameras',
    label: msg('Cameras'),
    icon: 'videocam',
    panels: ['cctv-panel'],
  },
  {
    id: 'street',
    label: msg('Street'),
    icon: 'streetview',
    panels: ['street-level-panel'],
  },
  {
    id: 'scenes',
    label: msg('Scenes'),
    icon: 'movie',
    panels: ['scene-panel'],
  },
  {
    id: 'display',
    label: msg('Display'),
    icon: 'tune',
    panels: ['pp-toggles'],
  },
  { id: 'style', label: msg('Style'), icon: 'palette', dock: 'control-panel' },
]);

/** The element id a tab opens. */
export function tabTargetId(tab) {
  return tab.dock || tab.panels[0];
}

/** The tab that owns a panel or dock tray id, or null. */
export function tabForTarget(targetId, tabs = PHONE_TABS) {
  return (
    tabs.find(
      (tab) => tab.dock === targetId || tab.panels?.includes(targetId),
    ) ?? null
  );
}

/**
 * Which rail children stay visible for a tab (none when no tab is open).
 * @param {string[]} childIds Rail children's ids.
 * @param {object|null} tab Open tab.
 * @returns {Set<string>}
 */
export function visibleRailChildren(childIds, tab) {
  const members = new Set(tab?.panels ?? []);
  return new Set(childIds.filter((id) => members.has(id)));
}

function toggleFor(documentRef, targetId) {
  return (
    documentRef.querySelector(
      `.panel-collapse-btn[data-collapse-target="${targetId}"]`,
    ) || documentRef.querySelector(`[data-dock-toggle-target="${targetId}"]`)
  );
}

/**
 * Install the phone shell. Inert above the breakpoint; follows the breakpoint
 * as the viewport changes (rotation, resizing).
 * @param {{documentRef?: Document, windowRef?: Window}} [options]
 * @returns {{destroy: Function, open: Function, close: Function}}
 */
export function initPhoneShell({
  documentRef = document,
  windowRef = window,
} = {}) {
  const body = documentRef.body;
  const media = windowRef.matchMedia(PHONE_SHELL_QUERY);
  let activeTab = null;
  let syncing = false;
  let nav = null;
  let observer = null;

  const isOpen = (id) => {
    const el = documentRef.getElementById(id);
    return Boolean(el) && !el.classList.contains('collapsed');
  };

  const setOpen = (id, open) => {
    if (isOpen(id) === open) return;
    const toggle = toggleFor(documentRef, id);
    if (!toggle) return;
    syncing = true;
    try {
      toggle.click();
    } finally {
      syncing = false;
    }
  };

  const applySheet = () => {
    for (const railId of RAIL_IDS) {
      const rail = documentRef.getElementById(railId);
      if (!rail) continue;
      const children = [...rail.children].filter((child) => child.id);
      const shown = visibleRailChildren(
        children.map((child) => child.id),
        activeTab,
      );
      for (const child of children)
        child.classList.toggle('phone-sheet-off', !shown.has(child.id));
      rail.classList.toggle('phone-sheet-off', shown.size === 0);
    }
    if (activeTab) body.dataset.phoneSheet = activeTab.id;
    else delete body.dataset.phoneSheet;
    for (const button of nav?.querySelectorAll('[data-phone-tab]') ?? [])
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.phoneTab === activeTab?.id),
      );
  };

  const open = (tab) => {
    if (activeTab && activeTab !== tab) setOpen(tabTargetId(activeTab), false);
    activeTab = tab;
    setOpen(tabTargetId(tab), true);
    applySheet();
    documentRef.getElementById(tabTargetId(tab))?.scrollIntoView?.({
      block: 'nearest',
    });
  };

  const close = () => {
    if (!activeTab) return;
    const tab = activeTab;
    activeTab = null;
    setOpen(tabTargetId(tab), false);
    applySheet();
  };

  const buildNav = () => {
    const bar = documentRef.createElement('nav');
    bar.id = 'phone-nav';
    bar.setAttribute('aria-label', t('Panels'));
    for (const tab of PHONE_TABS) {
      const button = documentRef.createElement('button');
      button.type = 'button';
      button.className = 'phone-nav-tab';
      button.dataset.phoneTab = tab.id;
      button.setAttribute('aria-pressed', 'false');
      const icon = documentRef.createElement('span');
      icon.className = 'material-symbols-outlined';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = tab.icon;
      const label = documentRef.createElement('span');
      label.className = 'phone-nav-label';
      label.textContent = t(tab.label);
      button.append(icon, label);
      button.addEventListener('click', () =>
        activeTab === tab ? close() : open(tab),
      );
      bar.append(button);
    }
    return bar;
  };

  // A panel opened by the app (or collapsed from its own header) moves the
  // sheet with it.
  const onClassChange = (records) => {
    if (syncing || !body.classList.contains('phone-shell')) return;
    for (const { target } of records) {
      const tab = tabForTarget(target.id);
      if (!tab) continue;
      const opened = !target.classList.contains('collapsed');
      if (opened && tab !== activeTab && target.id === tabTargetId(tab)) {
        open(tab);
        return;
      }
      if (!opened && tab === activeTab && target.id === tabTargetId(tab)) {
        activeTab = null;
        applySheet();
        return;
      }
    }
  };

  const enter = () => {
    body.classList.add('phone-shell');
    nav ??= buildNav();
    if (!nav.isConnected) body.append(nav);
    // Start from a clean globe: close whatever the desktop layout left open,
    // except the first panel that was open, which becomes the sheet.
    const opened = PHONE_TABS.filter((tab) => isOpen(tabTargetId(tab)));
    activeTab = null;
    for (const tab of opened.slice(1)) setOpen(tabTargetId(tab), false);
    if (opened[0]) open(opened[0]);
    else applySheet();
  };

  const leave = () => {
    activeTab = null;
    body.classList.remove('phone-shell');
    delete body.dataset.phoneSheet;
    nav?.remove();
    for (const el of documentRef.querySelectorAll('.phone-sheet-off'))
      el.classList.remove('phone-sheet-off');
  };

  const sync = () => (media.matches ? enter() : leave());

  const ObserverClass = windowRef.MutationObserver;
  if (ObserverClass) {
    observer = new ObserverClass(onClassChange);
    for (const tab of PHONE_TABS) {
      const el = documentRef.getElementById(tabTargetId(tab));
      if (el)
        observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    }
  }
  media.addEventListener?.('change', sync);
  sync();

  return {
    open: (tabId) => {
      const tab = PHONE_TABS.find((candidate) => candidate.id === tabId);
      if (tab && body.classList.contains('phone-shell')) open(tab);
    },
    close,
    destroy() {
      media.removeEventListener?.('change', sync);
      observer?.disconnect();
      leave();
    },
  };
}
