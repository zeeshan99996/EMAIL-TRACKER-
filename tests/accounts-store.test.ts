import { describe, it, expect, beforeEach } from 'vitest';

// Provide browser localStorage mockup for Node test runner
const storage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, val: string) => {
    storage[key] = String(val);
  },
  removeItem: (key: string) => {
    delete storage[key];
  },
  clear: () => {
    Object.keys(storage).forEach((k) => delete storage[k]);
  },
  key: (i: number) => Object.keys(storage)[i] || null,
  length: 0,
};

// @ts-ignore
global.window = global.window || ({} as any);
// @ts-ignore
global.localStorage = mockLocalStorage;

import {
  getLocalAccounts,
  saveAccountLocally,
  removeAccountLocally,
  mergeServerAndLocalAccounts,
} from '@/lib/client/accounts-store';

describe('Mailify Pro - Connected Accounts Persistent Store', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('should return empty list when no accounts stored', () => {
    const list = getLocalAccounts();
    expect(list).toEqual([]);
  });

  it('should save account locally and synchronize to custom mailboxes', () => {
    const saved = saveAccountLocally({
      email: 'founder@erhatechnologies.com',
      provider: 'gmail_app_password',
      status: 'connected',
    });

    expect(saved.email).toBe('founder@erhatechnologies.com');

    const accounts = getLocalAccounts();
    expect(accounts.length).toBe(1);
    expect(accounts[0].email).toBe('founder@erhatechnologies.com');

    // Check custom mailboxes sync
    const customRaw = mockLocalStorage.getItem('erha_custom_mailboxes');
    expect(customRaw).toBeTruthy();
    const customList = JSON.parse(customRaw!);
    expect(customList.length).toBe(1);
    expect(customList[0].email).toBe('founder@erhatechnologies.com');
  });

  it('should remove account locally from all storage keys', () => {
    const acc = saveAccountLocally({
      email: 'to-remove@company.com',
      provider: 'custom_smtp',
    });

    expect(getLocalAccounts().length).toBe(1);

    removeAccountLocally(acc.id);
    expect(getLocalAccounts().length).toBe(0);
  });

  it('should merge server and local accounts without losing local accounts on cold starts', () => {
    saveAccountLocally({
      email: 'local-only@gmail.com',
      provider: 'gmail_app_password',
      status: 'connected',
    });

    // Server returns empty list (e.g. serverless container cold start)
    const mergedEmpty = mergeServerAndLocalAccounts([]);
    expect(mergedEmpty.length).toBe(1);
    expect(mergedEmpty[0].email).toBe('local-only@gmail.com');

    // Server returns another account
    const mergedWithServer = mergeServerAndLocalAccounts([
      {
        id: 'acc_server_01',
        email: 'server-account@gmail.com',
        provider: 'gmail_app_password',
        status: 'connected',
      },
    ]);

    expect(mergedWithServer.length).toBe(2);
    const emails = mergedWithServer.map((a) => a.email);
    expect(emails).toContain('local-only@gmail.com');
    expect(emails).toContain('server-account@gmail.com');
  });
});
