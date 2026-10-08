import { describe, it, expect, afterEach, vi } from 'vitest';

function memoryStorage() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) };
}

// Fake Google Identity Services + Drive v3 REST, enough for the module's calls.
function fakeGoogle({ tokenError = null, popupClosed = false } = {}) {
  const drive = { files: new Map(), nextId: 1 };
  const calls = [];
  const oauth2 = {
    initTokenClient: cfg => ({
      requestAccessToken: opts => {
        calls.push({ type: 'token', prompt: opts.prompt, scope: cfg.scope });
        if (popupClosed) return cfg.error_callback({ type: 'popup_closed' });
        cfg.callback(tokenError ? { error: tokenError } : { access_token: 'tok', expires_in: 3599 });
      },
    }),
    revoke: vi.fn(),
  };
  const fetchMock = vi.fn(async (url, init = {}) => {
    const u = String(url);
    calls.push({ type: 'fetch', method: init.method || 'GET', url: u, auth: init.headers && init.headers.Authorization });
    if (u.startsWith('https://www.googleapis.com/drive/v3/files?')) {
      const files = [...drive.files.entries()].map(([id, f]) => ({ id, modifiedTime: f.modifiedTime }));
      return new Response(JSON.stringify({ files }), { status: 200 });
    }
    if (u.startsWith('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart')) {
      const id = 'f' + drive.nextId++;
      const body = String(init.body);
      const json = body.split('\r\n\r\n').pop().split('\r\n--')[0];
      drive.files.set(id, { content: json, modifiedTime: '2026-10-09T10:00:00.000Z', meta: body });
      return new Response(JSON.stringify({ id }), { status: 200 });
    }
    const patch = u.match(/upload\/drive\/v3\/files\/(\w+)\?uploadType=media/);
    if (patch) {
      drive.files.get(patch[1]).content = String(init.body);
      drive.files.get(patch[1]).modifiedTime = '2026-10-09T12:00:00.000Z';
      return new Response('{}', { status: 200 });
    }
    const media = u.match(/drive\/v3\/files\/(\w+)\?alt=media/);
    if (media) return new Response(drive.files.get(media[1]).content, { status: 200 });
    throw new Error('unexpected ' + u);
  });
  return { oauth2, fetchMock, drive, calls };
}

async function load(g, clientId = 'client-123.apps.googleusercontent.com') {
  vi.stubGlobal('localStorage', memoryStorage());
  vi.stubGlobal('window', { google: { accounts: { oauth2: g.oauth2 } } });
  vi.stubGlobal('fetch', g.fetchMock);
  vi.doMock('../src/constants.js', () => ({ DRIVE_CLIENT_ID: clientId }));
  const mod = await import('../src/lib/drivebackup.js');
  mod._resetForTests();
  return mod;
}

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); vi.doUnmock('../src/constants.js'); });

describe('Google Drive backup', () => {
  it('is hidden without a client ID', async () => {
    const m = await load(fakeGoogle(), '');
    expect(m.driveAvailable()).toBe(false);
  });

  it('asks only for the app-folder scope and keeps the token in memory', async () => {
    const g = fakeGoogle();
    const m = await load(g);
    expect(m.hasValidToken()).toBe(false);
    await m.requestToken({ consent: true });
    expect(m.hasValidToken()).toBe(true);
    expect(g.calls[0]).toMatchObject({ type: 'token', prompt: 'consent', scope: 'https://www.googleapis.com/auth/drive.appdata' });
    expect(localStorage.getItem('ps5vault_drive')).toBe(null); // nothing about the token is stored
  });

  it('creates the backup file in appDataFolder first, then overwrites it', async () => {
    const g = fakeGoogle();
    const m = await load(g);
    await m.requestToken();
    const s1 = await m.backupNow(m.buildPayload([{ id: 'a', title: 'Hades' }]));
    expect(g.drive.files.size).toBe(1);
    const meta = [...g.drive.files.values()][0].meta;
    expect(meta).toContain('"parents":["appDataFolder"]');
    expect(meta).toContain('"name":"ps5vault-backup.json"');
    expect(s1).toMatchObject({ enabled: true, lastCount: 1 });
    await m.backupNow(m.buildPayload([{ id: 'a', title: 'Hades' }, { id: 'b', title: 'Celeste' }]));
    expect(g.drive.files.size).toBe(1); // overwritten, not duplicated
    expect(JSON.parse([...g.drive.files.values()][0].content).count).toBe(2);
    expect(g.calls.filter(c => c.type === 'fetch').every(c => c.auth === 'Bearer tok')).toBe(true);
  });

  it('restores the latest backup, or reports none', async () => {
    const g = fakeGoogle();
    const m = await load(g);
    await m.requestToken();
    expect(await m.fetchBackup()).toBe(null);
    await m.backupNow(m.buildPayload([{ id: 'a', title: 'Hades' }]));
    const got = await m.fetchBackup();
    expect(got.data.games.map(x => x.title)).toEqual(['Hades']);
    expect(got.modifiedTime).toBeTruthy();
  });

  it('refuses to call Drive without a token and drops the token on 401', async () => {
    const g = fakeGoogle();
    const m = await load(g);
    await expect(m.backupNow(m.buildPayload([]))).rejects.toThrow('no token');
    await m.requestToken();
    g.fetchMock.mockImplementationOnce(async () => new Response('{}', { status: 401 }));
    await expect(m.fetchBackup()).rejects.toThrow('unauthorized');
    expect(m.hasValidToken()).toBe(false);
  });

  it('rejects when the user closes the Google popup or denies access', async () => {
    const m1 = await load(fakeGoogle({ popupClosed: true }));
    await expect(m1.requestToken()).rejects.toThrow('popup_closed');
    vi.resetModules();
    const m2 = await load(fakeGoogle({ tokenError: 'access_denied' }));
    await expect(m2.requestToken()).rejects.toThrow('access_denied');
  });

  it('flags a backup older than a day as stale, only when enabled', async () => {
    const m = await load(fakeGoogle());
    const now = Date.parse('2026-10-09T12:00:00Z');
    expect(m.backupStale({ enabled: false, lastBackupAt: null }, now)).toBe(false);
    expect(m.backupStale({ enabled: true, lastBackupAt: null }, now)).toBe(true);
    expect(m.backupStale({ enabled: true, lastBackupAt: '2026-10-09T00:00:00Z' }, now)).toBe(false);
    expect(m.backupStale({ enabled: true, lastBackupAt: '2026-10-08T00:00:00Z' }, now)).toBe(true);
  });

  it('disabling forgets the token and revokes it', async () => {
    const g = fakeGoogle();
    const m = await load(g);
    await m.requestToken();
    const st = m.disableDrive();
    expect(st.enabled).toBe(false);
    expect(m.hasValidToken()).toBe(false);
    expect(g.oauth2.revoke).toHaveBeenCalledWith('tok', expect.any(Function));
  });
});
