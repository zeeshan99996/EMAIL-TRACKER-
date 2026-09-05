import crypto from 'crypto';

export function generateSendIdempotencyKey({
  userId,
  sourceAccountId,
  targetAccountId,
  date,
  index = 0,
}: {
  userId: string;
  sourceAccountId: string;
  targetAccountId: string;
  date: string;
  index?: number;
}): string {
  const raw = `send:${userId}:${sourceAccountId}:${targetAccountId}:${date}:${index}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function generateReplyIdempotencyKey({
  userId,
  sourceAccountId,
  targetAccountId,
  threadId,
  messageId,
}: {
  userId: string;
  sourceAccountId: string;
  targetAccountId: string;
  threadId: string;
  messageId: string;
}): string {
  const raw = `reply:${userId}:${sourceAccountId}:${targetAccountId}:${threadId}:${messageId}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}
