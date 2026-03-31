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
