import crypto from 'crypto';
import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

const OTP_TTL = 600;
const MAX_ATTEMPTS = 5;
const LOCKOUT_TTL = 3600;
const MAX_OTP_PER_HOUR = 3;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = createClient({ url: redisUrl });
    redisClient.on('error', err => console.error('[Redis] Error:', err));
    await redisClient.connect().catch(() => {
      console.warn('[Redis] Connection failed, using in-memory fallback');
      redisClient = null;
    });
  }
  return redisClient!;
}

const memoryStore = new Map<
  string,
  { hash: string; attempts: number; locked: boolean; otpRequests: number }
>();

function getMemStore(key: string) {
  if (!memoryStore.has(key)) {
    memoryStore.set(key, { hash: '', attempts: 0, locked: false, otpRequests: 0 });
  }
  return memoryStore.get(key)!;
}

export async function storeOTP(phone: string, otp: string): Promise<void> {
  const hashedOTP = bcryptHash(otp);
  const client = await getRedisClient().catch(() => null);

  if (client) {
    await client.setEx(`otp:${phone}`, OTP_TTL, hashedOTP);
    await client.setEx(`otp:attempts:${phone}`, OTP_TTL, '0');
  } else {
    const store = getMemStore(phone);
    store.hash = hashedOTP;
    store.attempts = 0;
  }
}

export async function getOTP(phone: string): Promise<{ hash: string; attempts: number } | null> {
  const client = await getRedisClient().catch(() => null);

  if (client) {
    const hash = await client.get(`otp:${phone}`);
    const attempts = await client.get(`otp:attempts:${phone}`);
    if (!hash) return null;
    return { hash, attempts: parseInt(attempts || '0', 10) };
  } else {
    const store = getMemStore(phone);
    if (!store.hash) return null;
    return { hash: store.hash, attempts: store.attempts };
  }
}

export async function deleteOTP(phone: string): Promise<void> {
  const client = await getRedisClient().catch(() => null);

  if (client) {
    await client.del(`otp:${phone}`);
    await client.del(`otp:attempts:${phone}`);
  } else {
    const store = getMemStore(phone);
    store.hash = '';
    store.attempts = 0;
  }
}

export async function verifyOTP(inputOTP: string, storedHash: string): Promise<boolean> {
  return bcryptCompare(inputOTP, storedHash);
}

export async function incrementAttempt(phone: string): Promise<number> {
  const client = await getRedisClient().catch(() => null);

  let attempts = 0;

  if (client) {
    attempts = await client.incr(`otp:attempts:${phone}`);
    if (attempts >= MAX_ATTEMPTS) {
      await client.setEx(`otp:locked:${phone}`, LOCKOUT_TTL, '1');
    }
  } else {
    const store = getMemStore(phone);
    store.attempts += 1;
    attempts = store.attempts;
    if (attempts >= MAX_ATTEMPTS) {
      store.locked = true;
    }
  }

  return attempts;
}

export async function isRateLimited(
  phone: string,
  ip: string
): Promise<{ limited: boolean; retryAfter?: number }> {
  const client = await getRedisClient().catch(() => null);

  if (client) {
    const count = await client.incr(`otp:rate:${phone}`);
    if (count === 1) {
      await client.expire(`otp:rate:${phone}`, 3600);
    }
    if (count > MAX_OTP_PER_HOUR) {
      return { limited: true, retryAfter: 3600 };
    }
  }

  return { limited: false };
}

export async function isLockedOut(phone: string): Promise<boolean> {
  const client = await getRedisClient().catch(() => null);

  if (client) {
    const locked = await client.get(`otp:locked:${phone}`);
    return locked === '1';
  } else {
    return getMemStore(phone).locked;
  }
}

export async function recordOTPRequest(phone: string, ip: string): Promise<void> {
  const client = await getRedisClient().catch(() => null);

  if (client) {
    const count = await client.incr(`otp:req:${phone}`);
    if (count === 1) {
      await client.expire(`otp:req:${phone}`, 3600);
    }
  }
}

function bcryptHash(data: string): string {
  const salt = process.env.OTP_SECRET || 'default-salt-change-in-production';
  return crypto
    .createHash('sha256')
    .update(data + salt)
    .digest('hex');
}

function bcryptCompare(data: string, hash: string): boolean {
  return bcryptHash(data) === hash;
}

export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}
