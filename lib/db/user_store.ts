import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  salt: string;
  created_at: string;
  updated_at: string;
}

let cachedUsers: StoredUser[] | null = null;
let resolvedUserFile: string | null = null;

function getUserFilePath(): string {
  if (resolvedUserFile) {
    return resolvedUserFile;
  }

  const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (isServerless) {
    const tmpDir = path.join(os.tmpdir(), 'email-tracker-data');
    const tmpFile = path.join(tmpDir, 'users.json');
    const localSeedFile = path.join(process.cwd(), 'data', 'users.json');

    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      if (!fs.existsSync(tmpFile) && fs.existsSync(localSeedFile)) {
        fs.copyFileSync(localSeedFile, tmpFile);
      }
    } catch (err) {
      console.warn('[UserStore] Serverless /tmp prep warning:', err);
    }

    resolvedUserFile = tmpFile;
    return resolvedUserFile;
  }

  const localDir = path.join(process.cwd(), 'data');
  const localFile = path.join(localDir, 'users.json');

  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
  } catch {
    const fallbackDir = path.join(os.tmpdir(), 'email-tracker-data');
    try {
      if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    } catch {}
    resolvedUserFile = path.join(fallbackDir, 'users.json');
    return resolvedUserFile;
  }

  resolvedUserFile = localFile;
  return resolvedUserFile;
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function loadUsers(): StoredUser[] {
  if (cachedUsers) {
    return cachedUsers;
  }

  const filePath = getUserFilePath();

  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      cachedUsers = JSON.parse(raw) as StoredUser[];
      return cachedUsers;
    }
  } catch (err) {
    console.error('[UserStore] Failed to load users, reinitializing:', err);
  }

  // Pre-seed default user: admin@erhatechnologies.com / password123
  const defaultSalt = crypto.randomBytes(16).toString('hex');
  const defaultUser: StoredUser = {
    id: '7e352bba-1c84-494f-a795-c8b9121fd061',
    name: 'Admin User',
    email: 'admin@erhatechnologies.com',
    salt: defaultSalt,
    password_hash: hashPassword('password123', defaultSalt),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  cachedUsers = [defaultUser];
  saveUsers(cachedUsers);
  return cachedUsers;
}

function saveUsers(users: StoredUser[]): void {
  cachedUsers = users;
  const filePath = getUserFilePath();

  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('[UserStore] Failed to save users:', err);
  }
}

/**
 * Find user by email (case-insensitive)
 */
export function findUserByEmail(email: string): StoredUser | null {
  const cleanEmail = email.toLowerCase().trim();
  const users = loadUsers();
  return users.find((u) => u.email.toLowerCase().trim() === cleanEmail) || null;
}

/**
 * Register a new user in database.
 * Returns the created user, or throws an error if already exists.
 */
export function registerUser(params: {
  name?: string;
  email: string;
  password: string;
}): StoredUser {
  const cleanEmail = params.email.toLowerCase().trim();
  const existing = findUserByEmail(cleanEmail);

  if (existing) {
    throw new Error('An account with this email already exists. Please sign in.');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const password_hash = hashPassword(params.password, salt);
  const now = new Date().toISOString();

  const idHash = crypto.createHash('sha256').update(`user:${cleanEmail}`).digest('hex');
  const userId = `${idHash.slice(0, 8)}-${idHash.slice(8, 12)}-4${idHash.slice(13, 16)}-8${idHash.slice(17, 20)}-${idHash.slice(20, 32)}`;

  const newUser: StoredUser = {
    id: userId,
    name: params.name?.trim() || cleanEmail.split('@')[0],
    email: cleanEmail,
    salt,
    password_hash,
    created_at: now,
    updated_at: now,
  };

  const users = loadUsers();
  users.push(newUser);
  saveUsers(users);

  return newUser;
}

/**
 * Authenticate user credentials.
 * Returns { success: true, user } if password matches.
 * Returns { success: false, error } if password is wrong or user not found.
 */
export function authenticateUser(
  email: string,
  password: string
): { success: boolean; user?: StoredUser; error?: string } {
  const cleanEmail = email.toLowerCase().trim();
  const user = findUserByEmail(cleanEmail);

  if (!user) {
    return {
      success: false,
      error: 'No account found with this email. Please sign up.',
    };
  }

  const incomingHash = hashPassword(password, user.salt);

  // Constant-time buffer compare
  const incomingBuffer = Buffer.from(incomingHash, 'hex');
  const storedBuffer = Buffer.from(user.password_hash, 'hex');

  const matches =
    incomingBuffer.length === storedBuffer.length &&
    crypto.timingSafeEqual(incomingBuffer, storedBuffer);

  if (!matches) {
    return {
      success: false,
      error: 'Incorrect password. Please try again.',
    };
  }

  return {
    success: true,
    user,
  };
}
