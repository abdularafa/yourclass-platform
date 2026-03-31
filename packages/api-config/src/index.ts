import { z } from 'zod';

export const sendOtpSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone format'),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  device_fingerprint: z.string().optional(),
});

export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1),
});

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type AuthTokens = {
  access_token: string;
  refresh_token?: string;
};

export type JWTPayload = {
  sub: string;
  role: string;
  tenant_id: string | null;
  jti: string;
  iat?: number;
  exp?: number;
};
