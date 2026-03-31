export type UserRole = 'student' | 'teacher' | 'institute_admin' | 'platform_admin';
export type TenantStatus = 'pending' | 'active' | 'suspended' | 'banned' | 'deleted';
export type SubscriptionTier = 'starter' | 'growth' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'trialing' | 'active' | 'cancelled' | 'past_due' | 'unpaid';
export type CourseVisibility = 'draft' | 'published' | 'unlisted' | 'archived';
export type PricingModel = 'free' | 'one_time' | 'subscription' | 'installment';
export type LessonType = 'video' | 'pdf' | 'text' | 'audio' | 'quiz' | 'live' | 'external_link';
export type VideoTranscodeStatus = 'pending' | 'uploading' | 'processing' | 'ready' | 'failed';
export type LiveSessionStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';
export type QuestionType = 'mcq' | 'msq' | 'true_false' | 'fill_blank' | 'subjective';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type TestAttemptStatus = 'in_progress' | 'completed' | 'auto_submitted' | 'cancelled';
export type ResultVisibility = 'immediate' | 'delayed' | 'manual';
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'captured'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';
export type PaymentGateway = 'razorpay' | 'stripe';
export type AccessType = 'purchased' | 'free' | 'gifted' | 'trial' | 'installment';
export type NotificationType =
  | 'enrollment'
  | 'payment'
  | 'live_reminder'
  | 'test_result'
  | 'broadcast'
  | 'certificate'
  | 'system';
export type ChatRoomType = 'batch' | 'course' | 'doubt';
export type MessageContentType = 'text' | 'image' | 'file' | 'video';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  subdomain: string;
  custom_domain: string | null;
  logo_url: string | null;
  primary_color: string;
  app_description: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  commission_rate: number;
  status: TenantStatus;
  max_students: number;
  max_storage_gb: number;
  features: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  tenant_id: string | null;
  phone: string | null;
  email: string | null;
  name: string;
  avatar_url: string | null;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  last_active_at: Date | null;
  device_fingerprint: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TeacherProfile {
  id: string;
  user_id: string;
  tenant_id: string;
  bio: string | null;
  subjects: string[];
  document_url: string | null;
  verification_status: VerificationStatus;
  payout_type: string | null;
  payout_account: string | null;
  payout_bank_name: string | null;
  payout_ifsc: string | null;
  available_balance: number;
  total_earned: number;
  total_students: number;
  total_courses: number;
  created_at: Date;
  updated_at: Date;
}

export interface Course {
  id: string;
  tenant_id: string;
  teacher_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  language: string;
  pricing_model: PricingModel;
  price: number;
  discount_price: number | null;
  validity_days: number | null;
  enrollment_limit: number | null;
  total_enrolled: number;
  total_rating: number;
  total_reviews: number;
  certificate_enabled: boolean;
  prerequisites: string[];
  visibility: CourseVisibility;
  drip_content: boolean;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Module {
  id: string;
  course_id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  sequence: number;
  is_free_preview: boolean;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Lesson {
  id: string;
  module_id: string;
  course_id: string;
  tenant_id: string;
  title: string;
  lesson_type: LessonType;
  sequence: number;
  video_id: string | null;
  content: string | null;
  test_id: string | null;
  external_url: string | null;
  duration_seconds: number | null;
  is_published: boolean;
  is_free_preview: boolean;
  drip_days: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface Video {
  id: string;
  tenant_id: string;
  lesson_id: string | null;
  uploader_id: string;
  title: string;
  s3_key: string;
  hls_master_url: string | null;
  thumbnail_url: string | null;
  transcode_status: VideoTranscodeStatus;
  duration: number | null;
  resolution_variants: Record<string, unknown> | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface Batch {
  id: string;
  tenant_id: string;
  teacher_id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  start_date: Date | null;
  end_date: Date | null;
  max_students: number | null;
  enrolled_count: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LiveSession {
  id: string;
  tenant_id: string;
  teacher_id: string;
  batch_id: string | null;
  course_id: string;
  title: string;
  description: string | null;
  scheduled_at: Date;
  duration_minutes: number;
  actual_start_at: Date | null;
  actual_end_at: Date | null;
  agora_channel: string | null;
  recording_url: string | null;
  max_viewers: number;
  viewer_count: number;
  status: LiveSessionStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Test {
  id: string;
  tenant_id: string;
  course_id: string;
  teacher_id: string;
  title: string;
  instructions: string | null;
  time_limit_seconds: number | null;
  marks_per_question: number;
  negative_marking_pct: number;
  passing_score_pct: number;
  max_attempts: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  result_visibility: ResultVisibility;
  is_published: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Question {
  id: string;
  test_id: string;
  tenant_id: string;
  question_text: string;
  question_image_url: string | null;
  question_type: QuestionType;
  section: string | null;
  marks: number;
  negative_marks: number;
  difficulty: QuestionDifficulty;
  explanation: string | null;
  explanation_video_url: string | null;
  sequence: number;
  created_at: Date;
  updated_at: Date;
}

export interface Option {
  id: string;
  question_id: string;
  option_text: string;
  option_image_url: string | null;
  is_correct: boolean;
  sequence: number;
}

export interface TestAttempt {
  id: string;
  test_id: string;
  user_id: string;
  lesson_id: string | null;
  status: TestAttemptStatus;
  question_order: string[] | null;
  started_at: Date;
  submitted_at: Date | null;
  score: number | null;
  total_marks: number | null;
  percentage: number | null;
  rank: number | null;
  percentile: number | null;
  time_taken_seconds: number | null;
  tab_switch_count: number;
  is_flagged: boolean;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  batch_id: string | null;
  tenant_id: string;
  payment_id: string | null;
  access_type: AccessType;
  progress_pct: number;
  expires_at: Date | null;
  enrolled_at: Date;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Payment {
  id: string;
  user_id: string;
  tenant_id: string;
  course_id: string | null;
  batch_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gateway: PaymentGateway;
  gateway_order_id: string | null;
  gateway_payment_id: string | null;
  gateway_refund_id: string | null;
  platform_fee: number | null;
  teacher_earning: number | null;
  gateway_fee: number | null;
  coupon_id: string | null;
  coupon_code: string | null;
  coupon_discount: number | null;
  installment_number: number | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  tenant_id: string;
  title: string;
  body: string;
  type: NotificationType;
  action_url: string | null;
  read_at: Date | null;
  created_at: Date;
}

export interface ChatRoom {
  id: string;
  tenant_id: string;
  type: ChatRoomType;
  batch_id: string | null;
  course_id: string | null;
  name: string;
  is_muted: boolean;
  created_at: Date;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  tenant_id: string;
  user_id: string;
  content: string;
  content_type: MessageContentType;
  image_url: string | null;
  file_url: string | null;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: Date;
}

export interface WatchProgress {
  id: string;
  user_id: string;
  video_id: string;
  lesson_id: string | null;
  course_id: string | null;
  tenant_id: string;
  position_seconds: number;
  duration_seconds: number;
  completed: boolean;
  watch_count: number;
  last_watched_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
}

export interface UserWithRole extends User {
  role: UserRole;
  tenant_id: string | null;
}

export interface JWTPayload {
  sub: string;
  role: UserRole;
  tenant_id: string | null;
  jti: string;
  iat?: number;
  exp?: number;
}
