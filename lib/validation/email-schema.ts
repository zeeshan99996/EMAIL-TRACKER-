import { z } from 'zod';

export const createEmailSchema = z.object({
  to: z.string().email({ message: 'Invalid recipient email address' }),
  recipientName: z.string().optional().nullable(),
  subject: z.string().min(1, { message: 'Subject is required' }).max(255),
  html: z.string().min(1, { message: 'Email HTML content is required' }).max(500000, { message: 'HTML payload exceeds 500KB limit' }),
  messageId: z.string().optional().nullable(),
});

export const createApiKeySchema = z.object({
  name: z.string().min(1, { message: 'API Key name is required' }).max(64),
  projectId: z.string().uuid({ message: 'Invalid Project ID' }),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, { message: 'Project name is required' }).max(64),
  description: z.string().optional().nullable(),
});
