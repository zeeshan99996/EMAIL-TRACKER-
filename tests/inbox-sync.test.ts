import { describe, it, expect, beforeEach } from 'vitest';
import { inboxStore } from '../lib/db/inbox-store';

describe('Inbox Store & Management', () => {
  beforeEach(() => {
    inboxStore.clearAll();
  });

  it('should start with an empty inbox', () => {
    const messages = inboxStore.getMessages();
    expect(messages).toEqual([]);
  });

  it('should add new prospect replies and prevent duplicates', () => {
    const reply1 = {
      id: 'msg_01',
      senderName: 'John Doe',
      senderEmail: 'john@acme.corp',
      subject: 'Re: Partnership Inquiry',
      preview: 'Yes, we are interested in discussing details.',
      body: 'Hi, we received your message and are interested in scheduling a call.',
      receivedAt: new Date().toISOString(),
      unread: true,
      leadCompany: 'Acme Corp',
      tags: ['Warm Lead', 'Meeting Request'],
    };

    const res1 = inboxStore.addMessages([reply1]);
    expect(res1.addedCount).toBe(1);
    expect(res1.totalCount).toBe(1);

    // Duplicate addition should be ignored
    const res2 = inboxStore.addMessages([reply1]);
    expect(res2.addedCount).toBe(0);
    expect(res2.totalCount).toBe(1);
  });

  it('should mark message as read and unread', () => {
    const reply = {
      id: 'msg_02',
      senderName: 'Sarah Smith',
      senderEmail: 'sarah@tech.co',
      subject: 'Pricing request',
      preview: 'Please share your pricing deck.',
      body: 'Can you provide the standard package pricing?',
      receivedAt: new Date().toISOString(),
      unread: true,
      tags: ['Warm Lead'],
    };

    inboxStore.addMessages([reply]);
    expect(inboxStore.getMessages()[0].unread).toBe(true);

    inboxStore.markRead('msg_02');
    expect(inboxStore.getMessages()[0].unread).toBe(false);

    inboxStore.markUnread('msg_02');
    expect(inboxStore.getMessages()[0].unread).toBe(true);
  });

  it('should archive a thread', () => {
    const reply = {
      id: 'msg_03',
      senderName: 'Bob',
      senderEmail: 'bob@example.com',
      subject: 'Hello',
      preview: 'Hi',
      body: 'Hi',
      receivedAt: new Date().toISOString(),
      unread: false,
    };

    inboxStore.addMessages([reply]);
    expect(inboxStore.getMessages().length).toBe(1);

    inboxStore.archive('msg_03');
    expect(inboxStore.getMessages().length).toBe(0);
  });
});
