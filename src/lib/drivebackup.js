// v1.19.0 - Backup to the user's own Google Drive, in the app's hidden appDataFolder
// (scope drive.appdata: the app sees only its own folder, never the user's other files;
// Google classifies it as non-sensitive, so no security review is needed).
//
// A static web app cannot refresh Google access in the background, so this is "while you
// use the app" automatic: Google Identity Services hands out a ~1 h token after a tap, and
// changes are uploaded while that token is valid. When the last backup is older than a day,
// the app shows a one-tap card on Home. Restore on a new phone = sign in with the same
// Google account.
//
// Off unless DRIVE_CLIENT_ID (constants.js) is set. Never throws into the UI on its own:
// callers get rejected promises and decide what to show.
import { DRIVE_CLIENT_ID } from '../constants.js';
import { mergeSync } from './sync.js';

export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
export const BACKUP_FILE = 'ps5vault-backup.json';
const GIS_SRC = 'https://accounts.google.com/gsi/client';
const LS = 'ps5vault_drive';
const FILES = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';
const DAY = 24 * 3600 * 1000;

let token = null; // { value, exp } in memory only, never persisted
let gisPromise = null;

export function driveAvailable() {
  return !!DRIVE_CLIENT_ID;
}

export function readDriveState() {
  try {
    const s = JSON.parse(localStorage.getItem(LS) || 'null');
    return s && typeof s === 'object' ? { enabled: !!s.enabled, lastBackupAt: s.lastBackupAt || null, lastCount: s.lastCount ?? null } : { enabled: false, lastBackupAt: null, lastCount: null };
  } catch {
    return { enabled: false, lastBackupAt: null, lastCount: null };
  }
}

function writeDriveState(patch) {
  const next = { ...readDriveState(), ...patch };
  try { localStorage.setItem(LS, JSON.stringify(next)); } catch {}
  return next;
}

export function backupStale(state = readDriveState(), now = Date.now()) {
  if (!state.enabled) return false;
  if (!state.lastBackupAt) return true;
  const t = Date.parse(state.lastBackupAt);
  return !Number.isFinite(t) || now - t > DAY;
}

// Load Google Identity Services ahead of time: the sign-in popup must open synchronously
// inside a tap, so the script has to be ready before the user taps.
export function loadGis() {
  if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) return Promise.resolve();
  if (!gisPromise) {
    gisPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = GIS_SRC;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => { gisPromise = null; reject(new Error('gis load failed')); };
      document.head.appendChild(s);
    });
  }
  return gisPromise;
}

export function gisReady() {
  return typeof window !== 'undefined' && !!window.google?.accounts?.oauth2;
}

export function hasValidToken(now = Date.now()) {
  return !!token && token.exp - 60_000 > now;
}

// Call synchronously from a click handler. `consent` forces the account/permission screen
// (first enable, or after the user revoked access).
export function requestToken({ consent = false } = {}) {
  return new Promise((resolve, reject) => {
    const oauth2 = typeof window !== 'undefined' ? window.google?.accounts?.oauth2 : null;
    if (!oauth2) { reject(new Error('gis not loaded')); return; }
    const client = oauth2.initTokenClient({
      client_id: DRIVE_CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: r => {
        if (!r || r.error || !r.access_token) { reject(new Error((r && r.error) || 'no token')); return; }
        token = { value: r.access_token, exp: Date.now() + (Number(r.expires_in) || 3600) * 1000 };
        resolve();
      },
      error_callback: e => reject(new Error((e && e.type) || 'popup error')),
    });
    client.requestAccessToken({ prompt: consent ? 'consent' : '' });
  });
}

async function api(url, init = {}) {
  if (!hasValidToken()) throw new Error('no token');
  const res = await fetch(url, { ...init, headers: { ...(init.headers || {}), Authorization: 'Bearer ' + token.value } });
  if (res.status === 401) { token = null; throw new Error('unauthorized'); }
  if (!res.ok) throw new Error('drive ' + res.status);
  return res;
}

async function findBackupFile() {
  const q = encodeURIComponent(`name='${BACKUP_FILE}' and trashed=false`);
  const res = await api(`${FILES}?spaces=appDataFolder&q=${q}&fields=files(id,modifiedTime)&orderBy=modifiedTime%20desc&pageSize=1`);
  const json = await res.json();
  return (json.files && json.files[0]) || null;
}

export function buildPayload(games, extras = {}) {
  return { version: 1, exported: new Date().toISOString(), count: games.length, games, ...extras };
}

// Create the file the first time, overwrite it afterwards (one backup, always the newest).
export async function backupNow(payload) {
  const body = JSON.stringify(payload);
  const existing = await findBackupFile();
  if (existing) {
    await api(`${UPLOAD}/${existing.id}?uploadType=media`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body });
  } else {
    const boundary = 'ps5vault' + Math.random().toString(36).slice(2);
    const meta = JSON.stringify({ name: BACKUP_FILE, parents: ['appDataFolder'], mimeType: 'application/json' });
    const multipart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n` +
      `--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`;
    await api(`${UPLOAD}?uploadType=multipart&fields=id`, { method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body: multipart });
  }
  return writeDriveState({ enabled: true, lastBackupAt: new Date().toISOString(), lastCount: payload.count });
}

// Returns { data, modifiedTime } or null when this Google account has no backup yet.
export async function fetchBackup() {
  const file = await findBackupFile();
  if (!file) return null;
  const res = await api(`${FILES}/${file.id}?alt=media`);
  return { data: await res.json(), modifiedTime: file.modifiedTime };
}

// v1.22.0 - Sync: read the Drive copy, merge it with this phone (sync.js), hand the result to
// apply() so the app stores it, then upload the merged copy. getLocal() returns
// { games, wishlist, tombstones, wishTombstones }.
export async function syncNow(getLocal, apply) {
  const remote = await fetchBackup();
  const data = remote && (Array.isArray(remote.data) ? { games: remote.data } : remote.data);
  const m = mergeSync(getLocal(), data);
  apply(m);
  return backupNow(buildPayload(m.games, { wishlist: m.wishlist, tombstones: m.tombstones, wishTombstones: m.wishTombstones }));
}

// After a restore: backup is on and the Drive copy is as fresh as the restored data.
export function markDriveEnabled(patch = {}) {
  return writeDriveState({ enabled: true, ...patch });
}

export function disableDrive() {
  const old = token;
  token = null;
  try { if (old && window.google?.accounts?.oauth2?.revoke) window.google.accounts.oauth2.revoke(old.value, () => {}); } catch {}
  return writeDriveState({ enabled: false });
}

export function _resetForTests() {
  token = null;
  gisPromise = null;
}
