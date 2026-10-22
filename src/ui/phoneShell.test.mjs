import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import {
  PHONE_TABS,
  tabForTarget,
  tabTargetId,
  visibleRailChildren,
} from './phoneShell.js';

const TEMPLATES = new URL('./templates/', import.meta.url);
const markup = readdirSync(TEMPLATES)
  .filter((name) => name.endsWith('.html'))
  .map((name) => readFileSync(new URL(name, TEMPLATES), 'utf8'))
  .join('\n');

test('every tab opens a panel or dock tray that exists and has a toggle', () => {
  for (const tab of PHONE_TABS) {
    const id = tabTargetId(tab);
    assert.ok(
      markup.includes(`id="${id}"`),
      `${tab.id}: #${id} is in the templates`,
    );
    const toggle = tab.dock
      ? `data-dock-toggle-target="${id}"`
      : `data-collapse-target="${id}"`;
    assert.ok(markup.includes(toggle), `${tab.id}: #${id} has ${toggle}`);
  }
});

test('panels map back to the tab that shows them', () => {
  assert.equal(tabForTarget('data-panel').id, 'layers');
  assert.equal(tabForTarget('weather-panel').id, 'layers');
  assert.equal(tabForTarget('location-bar').id, 'search');
  assert.equal(tabForTarget('control-panel').id, 'style');
  assert.equal(tabForTarget('cctv-panel').id, 'cameras');
  assert.equal(tabForTarget('nonexistent'), null);
  const owners = PHONE_TABS.flatMap((tab) => tab.panels ?? [tab.dock]);
  assert.equal(
    new Set(owners).size,
    owners.length,
    'no panel belongs to two tabs',
  );
});

test('the sheet shows only the open tab’s rail panels', () => {
  const rail = [
    'pp-toggles',
    'cctv-panel',
    'weather-panel',
    'street-level-panel',
  ];
  const layers = PHONE_TABS.find((tab) => tab.id === 'layers');
  const search = PHONE_TABS.find((tab) => tab.id === 'search');
  assert.deepEqual([...visibleRailChildren(rail, layers)], ['weather-panel']);
  assert.deepEqual([...visibleRailChildren(rail, search)], []);
  assert.deepEqual([...visibleRailChildren(rail, null)], []);
});
