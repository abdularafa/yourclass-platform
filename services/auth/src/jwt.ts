import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '@yourclass/database';

const JWT_ALGORITHM = 'RS256';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

let jwtPublicKey = '';
let jwtPrivateKey = '';

function getKeys() {
  if (!jwtPublicKey) {
    jwtPublicKey = process.env.JWT_PUBLIC_KEY || '';
    jwtPrivateKey = process.env.JWT_PRIVATE_KEY || '';

    if (!jwtPublicKey || !jwtPrivateKey) {
      console.warn('[Auth] JWT keys not configured, using fallback');
      jwtPublicKey = 'fallback-public-key';
      jwtPrivateKey = 'fallback-private-key';
    }
  }
  return { publicKey: jwtPublicKey, privateKey: jwtPrivateKey };
}

export function generateJTI(): string {
  return crypto.randomUUID();
}

export interface TokenPayload {
  sub: string;
  role: string;
  tenant_id: string | null;
  jti: string;
}

export async function generateAccessToken(payload: TokenPayload): Promise<string> {
  const { privateKey } = getKeys();

  return jwt.sign(payload, privateKey, {
    algorithm: JWT_ALGORITHM,
    expiresIn: ACCESS_TOKEN_EXPIRY,
    jwtid: payload.jti,
  });
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { publicKey } = getKeys();
    const decoded = jwt.verify(token, publicKey, {
      algorithms: [JWT_ALGORITHM],
    }) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('[JWT] Verification failed:', error);
    return null;
  }
}

export async function createSession(params: {
  userId: string;
  tenantId?: string;
  tokenHash: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  return prisma.session.create({
    data: {
      user_id: params.userId,
      tenant_id: params.tenantId,
      token_hash: params.tokenHash,
      device_fingerprint: params.deviceFingerprint,
      ip_address: params.ipAddress,
      user_agent: params.userAgent,
      expires_at: expiresAt,
    },
  });
}

export async function refreshSession(tokenHash: string) {
  return prisma.session.findFirst({
    where: {
      token_hash: tokenHash,
      is_revoked: false,
      expires_at: { gt: new Date() },
    },
    include: { user: true },
  });
}

export async function revokeSession(tokenHash: string) {
  return prisma.session.updateMany({
    where: { token_hash: tokenHash },
    data: { is_revoked: true, revoked_at: new Date() },
  });
}

export async function revokeAllUserSessions(userId: string) {
  return prisma.session.updateMany({
    where: { user_id: userId },
    data: { is_revoked: true, revoked_at: new Date() },
  });
}
