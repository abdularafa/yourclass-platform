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

export const createTenantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .regex(/^[a-z0-9]+$/, 'Subdomain must be lowercase alphanumeric'),
  app_name: z.string().min(2, 'App name must be at least 2 characters'),
  primary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    .optional(),
  custom_domain: z.string().url().optional(),
});

export const updateTenantSchema = createTenantSchema.partial();

export const createUserSchema = z.object({
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  email: z.string().email().optional(),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['student', 'teacher', 'institute_admin', 'platform_admin']).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  avatar_url: z.string().url().optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  email: z.string().email().optional(),
});

export const createCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
  thumbnail_url: z.string().url().optional(),
  category_id: z.string().uuid().optional(),
  language: z.string().default('en'),
  pricing_model: z.enum(['free', 'one_time', 'subscription', 'installment']),
  price: z.number().min(0),
  discount_price: z.number().min(0).optional(),
  validity_days: z.number().positive().optional(),
  enrollment_limit: z.number().positive().optional(),
  certificate_enabled: z.boolean().default(false),
  prerequisites: z.array(z.string().uuid()).default([]),
  visibility: z.enum(['draft', 'published', 'unlisted', 'archived']).default('draft'),
  drip_content: z.boolean().default(false),
});

export const updateCourseSchema = createCourseSchema.partial();

export const createModuleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  sequence: z.number().int().positive(),
  is_free_preview: z.boolean().default(false),
  is_published: z.boolean().default(false),
});

export const createLessonSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  lesson_type: z.enum(['video', 'pdf', 'text', 'audio', 'quiz', 'live', 'external_link']),
  sequence: z.number().int().positive(),
  video_id: z.string().uuid().optional(),
  content: z.string().optional(),
  test_id: z.string().uuid().optional(),
  external_url: z.string().url().optional(),
  duration_seconds: z.number().int().positive().optional(),
  is_published: z.boolean().default(false),
  is_free_preview: z.boolean().default(false),
  drip_days: z.number().int().positive().optional(),
});

export const createBatchSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  thumbnail_url: z.string().url().optional(),
  price: z.number().min(0),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  max_students: z.number().positive().optional(),
  course_ids: z.array(z.string().uuid()).default([]),
});

export const createLiveSessionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  course_id: z.string().uuid('Invalid course ID'),
  batch_id: z.string().uuid().optional(),
  scheduled_at: z.string().datetime(),
  duration_minutes: z.number().int().positive().default(60),
  max_viewers: z.number().int().positive().default(300),
});

export const createTestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  instructions: z.string().optional(),
  course_id: z.string().uuid('Invalid course ID'),
  time_limit_seconds: z.number().int().positive().optional(),
  marks_per_question: z.number().positive().default(1),
  negative_marking_pct: z.number().min(0).max(100).default(0),
  passing_score_pct: z.number().min(0).max(100).default(35),
  max_attempts: z.number().int().positive().default(1),
  shuffle_questions: z.boolean().default(false),
  shuffle_options: z.boolean().default(false),
  result_visibility: z.enum(['immediate', 'delayed', 'manual']).default('immediate'),
  is_published: z.boolean().default(false),
});

export const createQuestionSchema = z.object({
  question_text: z.string().min(1, 'Question text is required'),
  question_image_url: z.string().url().optional(),
  question_type: z.enum(['mcq', 'msq', 'true_false', 'fill_blank', 'subjective']).default('mcq'),
  section: z.string().optional(),
  marks: z.number().positive().default(1),
  negative_marks: z.number().min(0).default(0),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  explanation: z.string().optional(),
  explanation_video_url: z.string().url().optional(),
  sequence: z.number().int().positive(),
  options: z
    .array(
      z.object({
        option_text: z.string().min(1),
        option_image_url: z.string().url().optional(),
        is_correct: z.boolean(),
        sequence: z.number().int().positive(),
      })
    )
    .optional(),
});

export const submitTestSchema = z.object({
  answers: z.array(
    z.object({
      question_id: z.string().uuid(),
      selected_option_ids: z.array(z.string().uuid()),
      time_spent_seconds: z.number().int().positive().optional(),
    })
  ),
});

export const createPaymentSchema = z.object({
  course_id: z.string().uuid().optional(),
  batch_id: z.string().uuid().optional(),
  amount: z.number().positive(),
  currency: z.string().default('INR'),
  coupon_code: z.string().optional(),
});

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .regex(/^[A-Z0-9]+$/, 'Code must be uppercase alphanumeric'),
  discount_type: z.enum(['percentage', 'flat']),
  discount_value: z.number().positive(),
  min_order_amount: z.number().positive().optional(),
  max_discount_amount: z.number().positive().optional(),
  max_uses: z.number().int().positive().optional(),
  per_user_limit: z.number().int().positive().optional(),
  course_id: z.string().uuid().optional(),
  applicable_course_ids: z.array(z.string().uuid()).optional(),
  starts_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  is_active: z.boolean().default(true),
});

export const createPayoutSchema = z.object({
  amount: z.number().positive(),
  payout_type: z.enum(['upi', 'bank']),
  payout_account: z.string().min(1),
  payout_bank_name: z.string().optional(),
  payout_ifsc: z.string().optional(),
});

export const createNotificationSchema = z.object({
  user_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  type: z.enum([
    'enrollment',
    'payment',
    'live_reminder',
    'test_result',
    'broadcast',
    'certificate',
    'system',
  ]),
  action_url: z.string().url().optional(),
});

export const broadcastSchema = z.object({
  type: z.enum(['all', 'batch', 'course']),
  batch_id: z.string().uuid().optional(),
  course_id: z.string().uuid().optional(),
  title: z.string().min(1),
  body: z.string().min(1),
});

export const sendMessageSchema = z.object({
  room_id: z.string().uuid(),
  content: z.string().min(1, 'Message content is required').max(5000),
  content_type: z.enum(['text', 'image', 'file', 'video']).default('text'),
  image_url: z.string().url().optional(),
  file_url: z.string().url().optional(),
});

export const createDoubtSchema = z.object({
  lesson_id: z.string().uuid(),
  question_text: z.string().min(10, 'Question must be at least 10 characters'),
});

export const replyDoubtSchema = z.object({
  content: z.string().min(1, 'Reply content is required'),
  video_url: z.string().url().optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const courseFilterSchema = z.object({
  category_id: z.string().uuid().optional(),
  visibility: z.enum(['draft', 'published', 'unlisted', 'archived']).optional(),
  teacher_id: z.string().uuid().optional(),
  search: z.string().optional(),
  sort_by: z.enum(['created_at', 'title', 'price', 'total_enrolled']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
});

export const studentFilterSchema = z.object({
  role: z.enum(['student', 'teacher']).optional(),
  search: z.string().optional(),
  enrolled_in_course: z.string().uuid().optional(),
  enrolled_in_batch: z.string().uuid().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const slugParamSchema = z.object({
  slug: z.string().min(1),
});

export const videoUploadSchema = z.object({
  title: z.string().min(1),
  lesson_id: z.string().uuid().optional(),
  tenant_id: z.string().uuid(),
});
