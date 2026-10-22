import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ACCESS_COOKIE,
  LOGIN_PATH,
  accessToken,
  gateDecision,
  loginPage,
  passwordFromForm,
  readCookie,
} from '../scripts/cloud-start.mjs';

const token = accessToken('correct horse');

test('only the signed-in cookie opens the app and its API', () => {
  const signedIn = `theme=dark; ${ACCESS_COOKIE}=${token}`;
  for (const url of ['/', '/assets/index-abc.js', '/api/flights?lamin=1'])
    assert.equal(gateDecision({ method: 'GET', url, cookie: signedIn, token }), 'pass');
  assert.equal(
    gateDecision({ method: 'GET', url: '/', cookie: `${ACCESS_COOKIE}=${accessToken('old')}`, token }),
    'page',
    'a cookie from an earlier password is not accepted',
  );
  assert.equal(gateDecision({ method: 'GET', url: '/?setup=1', cookie: '', token }), 'page');
  assert.equal(gateDecision({ method: 'GET', url: '/api/flights', cookie: '', token }), 'deny');
  assert.equal(gateDecision({ method: 'POST', url: '/api/realtime/token', cookie: '', token }), 'deny');
  assert.equal(gateDecision({ method: 'GET', url: '/assets/index-abc.js', cookie: '', token }), 'deny');
});

test('Home Screen icons and the sign-in route are reachable before sign-in', () => {
  for (const url of ['/manifest.webmanifest', '/icons/icon-180.png', '/logo.svg'])
    assert.equal(gateDecision({ method: 'GET', url, cookie: '', token }), 'pass');
  assert.equal(gateDecision({ method: 'GET', url: '/icons/../.env', cookie: '', token }), 'deny');
  // Scene assets load with credentials omitted, so they cannot need the cookie.
  for (const url of ['/scene-assets/wainwright-2026/after-2026-10-19.png', '/scene-assets/wainwright-2026/burn-scar.json'])
    assert.equal(gateDecision({ method: 'GET', url, cookie: '', token }), 'pass');
  for (const url of ['/scene-assets/../.env', '/scene-assets/a/b/c.json', '/scene-assets/x/readme.md'])
    assert.equal(gateDecision({ method: 'GET', url, cookie: '', token }), 'deny', url);
  assert.equal(gateDecision({ method: 'POST', url: LOGIN_PATH, cookie: '', token }), 'login');
  assert.equal(gateDecision({ method: 'GET', url: LOGIN_PATH, cookie: '', token }), 'page');
});

test('form and cookie parsing', () => {
  assert.equal(passwordFromForm('password=correct+horse'), 'correct horse');
  assert.equal(passwordFromForm('other=1'), '');
  assert.equal(readCookie(`a=1; ${ACCESS_COOKIE}=xyz`, ACCESS_COOKIE), 'xyz');
  assert.equal(readCookie(undefined, ACCESS_COOKIE), '');
  assert.ok(!/<script/i.test(loginPage('<b>')));
  assert.ok(loginPage('<b>').includes('&#60;b&#62;'));
});
