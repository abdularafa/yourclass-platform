import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { ZodError } from 'zod';
import { sendOtpSchema, verifyOtpSchema } from './validators.js';
import {
  generateOTP,
  storeOTP,
  getOTP,
  deleteOTP,
  verifyOTP,
  incrementAttempt,
  isRateLimited,
  isLockedOut,
  recordOTPRequest,
} from './otp.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  generateJTI,
  createSession,
  refreshSession,
  revokeSession,
} from './jwt.js';
import { prisma } from './prisma.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  })
);
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth', timestamp: new Date().toISOString() });
});

app.post('/api/v1/auth/send-otp', async (req: Request, res: Response) => {
  try {
    const { phone } = sendOtpSchema.parse(req.body);

    const rateLimit = await isRateLimited(phone, req.ip || '');
    if (rateLimit.limited) {
      return res.status(429).json({
        success: false,
        error: 'rate_limited',
        message: 'Too many requests. Please try again later.',
        retry_after: rateLimit.retryAfter,
      });
    }

    if (await isLockedOut(phone)) {
      return res.status(429).json({
        success: false,
        error: 'locked_out',
        message: 'Too many failed attempts. Please try again in 1 hour.',
      });
    }

    const otp = generateOTP();
    await storeOTP(phone, otp);
    await recordOTPRequest(phone, req.ip || '');

    console.log(`[OTP] ${phone}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      expires_in: 600,
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return res.status(422).json({
        success: false,
        error: 'validation_error',
        details: error.errors,
      });
    }
    console.error('[Auth] Send OTP error:', error);
    return res.status(500).json({
      success: false,
      error: 'internal_error',
      message: 'Failed to send OTP',
    });
  }
});

app.post('/api/v1/auth/verify-otp', async (req: Request, res: Response) => {
  try {
    const { phone, otp, device_fingerprint } = verifyOtpSchema.parse(req.body);

    const otpStore = await getOTP(phone);
    if (!otpStore) {
      return res.status(401).json({
        success: false,
        error: 'otp_expired',
        message: 'OTP has expired. Please request a new one.',
      });
    }

    if (otpStore.attempts >= 5) {
      return res.status(429).json({
        success: false,
        error: 'too_many_attempts',
        message: 'Too many failed attempts. Please request a new OTP.',
      });
    }

    const isValid = await verifyOTP(otp, otpStore.hash);
    if (!isValid) {
      const attempts = await incrementAttempt(phone);
      return res.status(401).json({
        success: false,
        error: 'invalid_otp',
        message: `Invalid OTP. ${5 - attempts} attempts remaining.`,
      });
    }

    await deleteOTP(phone);

    let user = await prisma.user.findFirst({
      where: { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: 'New User',
          role: 'student',
        },
      });
    }

    const accessToken = await generateAccessToken({
      sub: user.id,
      role: user.role,
      tenant_id: user.tenant_id,
      jti: generateJTI(),
    });

    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashToken(refreshToken);

    await createSession({
      userId: user.id,
      tenantId: user.tenant_id || undefined,
      tokenHash: refreshTokenHash,
      deviceFingerprint: device_fingerprint,
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent'],
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        access_token: accessToken,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          tenant_id: user.tenant_id,
        },
      },
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return res.status(422).json({
        success: false,
        error: 'validation_error',
        details: error.errors,
      });
    }
    console.error('[Auth] Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      error: 'internal_error',
      message: 'Failed to verify OTP',
    });
  }
});

app.post('/api/v1/auth/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'no_token',
        message: 'No refresh token provided',
      });
    }

    const refreshTokenHash = hashToken(refreshToken);
    const session = await refreshSession(refreshTokenHash);

    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'invalid_token',
        message: 'Invalid or expired token',
      });
    }

    const accessToken = await generateAccessToken({
      sub: session.user.id,
      role: session.user.role,
      tenant_id: session.user.tenant_id,
      jti: generateJTI(),
    });

    res.json({
      success: true,
      data: { access_token: accessToken },
    });
  } catch (error) {
    console.error('[Auth] Refresh error:', error);
    return res.status(500).json({
      success: false,
      error: 'internal_error',
      message: 'Failed to refresh token',
    });
  }
});

app.post('/api/v1/auth/logout', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      const refreshTokenHash = hashToken(refreshToken);
      await revokeSession(refreshTokenHash);
    }

    res.clearCookie('refresh_token');
    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('[Auth] Logout error:', error);
    return res.status(500).json({
      success: false,
      error: 'internal_error',
      message: 'Failed to logout',
    });
  }
});

app.post('/api/v1/auth/email-login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'missing_fields',
        message: 'Email and password are required',
      });
    }

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
      include: { teacher_profile: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'invalid_credentials',
        message: 'Invalid email or password',
      });
    }

    const accessToken = await generateAccessToken({
      sub: user.id,
      role: user.role,
      tenant_id: user.tenant_id,
      jti: generateJTI(),
    });

    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashToken(refreshToken);

    await createSession({
      userId: user.id,
      tenantId: user.tenant_id || undefined,
      tokenHash: refreshTokenHash,
      deviceFingerprint: req.body.device_fingerprint,
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent'],
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        access_token: accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenant_id: user.tenant_id,
        },
      },
    });
  } catch (error) {
    console.error('[Auth] Email login error:', error);
    return res.status(500).json({
      success: false,
      error: 'internal_error',
      message: 'Failed to login',
    });
  }
});

app.post('/api/v1/auth/signup', async (req: Request, res: Response) => {
  try {
    const { phone, email, name, role = 'student' } = req.body;

    if (!name || (!phone && !email)) {
      return res.status(400).json({
        success: false,
        error: 'missing_fields',
        message: 'Name and either phone or email are required',
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone: phone || undefined }, { email: email?.toLowerCase() || undefined }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'user_exists',
        message: 'User already exists with this phone or email',
      });
    }

    const user = await prisma.user.create({
      data: {
        phone: phone || null,
        email: email?.toLowerCase() || null,
        name,
        role,
      },
    });

    const accessToken = await generateAccessToken({
      sub: user.id,
      role: user.role,
      tenant_id: user.tenant_id,
      jti: generateJTI(),
    });

    res.status(201).json({
      success: true,
      data: {
        access_token: accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('[Auth] Signup error:', error);
    return res.status(500).json({
      success: false,
      error: 'internal_error',
      message: 'Failed to create account',
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[Auth Service] Running on port ${PORT}`);
});

export default app;
