/**
 * Business Configuration
 * 业务配置 - 请根据您的需求修改这些值
 */

// ==================== 支持的语言列表 ====================
export const SUPPORTED_LANGUAGES = [
  "English",
  "Chinese (Mandarin)",
  "Chinese (Cantonese)",
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Korean",
  "Italian",
  "Portuguese",
  "Russian",
  "Arabic",
  "Hindi",
  "Thai",
  "Vietnamese",
] as const

// ==================== 支持的时区列表 ====================
export const SUPPORTED_TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "America/Denver", label: "Mountain Time (US & Canada)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris, Berlin, Rome" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Shanghai", label: "Beijing, Shanghai" },
  { value: "Asia/Hong_Kong", label: "Hong Kong" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Seoul", label: "Seoul" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
] as const

// ==================== 课程时长选项（分钟）====================
export const LESSON_DURATIONS = [20, 45, 60, 90] as const

// ==================== 取消和退款政策 ====================
export const CANCELLATION_POLICY = {
  // 免费取消的提前时间（小时）
  FREE_CANCELLATION_HOURS: 24,
  
  // 退款比例（根据取消时间）
  REFUND_PERCENTAGES: {
    MORE_THAN_24H: 100, // 提前24小时以上：100%退款
    MORE_THAN_12H: 50,  // 提前12-24小时：50%退款
    LESS_THAN_12H: 0,   // 少于12小时：不退款
  },
  
  // 政策描述文本
  DESCRIPTION: `
    - Cancel more than 24 hours before the lesson: 100% refund
    - Cancel 12-24 hours before: 50% refund  
    - Cancel less than 12 hours before: No refund
    - No-show: No refund
  `.trim(),
} as const

// ==================== 平台费用配置 ====================
export const PLATFORM_FEES = {
  // 平台抽成比例（例如：0.15 = 15%）
  COMMISSION_RATE: 0.15,
  
  // 是否对学生显示平台费（如果false，从教师收入中扣除）
  SHOW_TO_STUDENT: false,
  
  // 计算教师实际收入
  calculateTeacherEarnings: (amount: number) => {
    return amount * (1 - PLATFORM_FEES.COMMISSION_RATE)
  },
  
  // 计算学生需要支付的金额
  calculateStudentPayment: (teacherRate: number, durationMinutes: number) => {
    const baseAmount = (teacherRate / 60) * durationMinutes
    if (PLATFORM_FEES.SHOW_TO_STUDENT) {
      return baseAmount * (1 + PLATFORM_FEES.COMMISSION_RATE)
    }
    return baseAmount
  },
} as const

// ==================== 提醒通知配置 ====================
export const REMINDER_CONFIG = {
  // 发送提醒的时间点（课程开始前多少小时）
  REMINDER_TIMES: [24, 1], // 24小时前和1小时前
  
  // 是否启用短信提醒（需要配置SMS服务）
  SMS_ENABLED: false,
  
  // 是否启用邮件提醒
  EMAIL_ENABLED: true,
} as const

// ==================== 教师配置 ====================
export const TEACHER_CONFIG = {
  // 最低时薪（美元）
  MIN_HOURLY_RATE: 10,
  
  // 最高时薪（美元）
  MAX_HOURLY_RATE: 200,
  
  // 默认缓冲时间（分钟）- 课程之间的间隔
  DEFAULT_BUFFER_TIME: 10,
  
  // 最短工作经验（年）
  MIN_YEARS_EXPERIENCE: 0,
  
  // 最多可选语言数量
  MAX_LANGUAGES: 5,
} as const

// ==================== 预订限制 ====================
export const BOOKING_CONFIG = {
  // 最早可以预订的天数（提前）
  MAX_ADVANCE_DAYS: 90,
  
  // 最晚可以预订的小时数（提前）
  MIN_ADVANCE_HOURS: 2,
  
  // 学生同时进行中的预订上限
  MAX_ACTIVE_BOOKINGS_PER_STUDENT: 10,
  
  // 教师每天最多课程数
  MAX_LESSONS_PER_DAY: 8,
} as const

// ==================== 会议链接配置 ====================
export const MEETING_CONFIG = {
  // 会议链接生成优先级
  PRIORITY: ["zoom", "google_meet", "simple"] as const,
  
  // 简单会议链接的域名
  SIMPLE_MEETING_DOMAIN: "meet.flexibook.com",
  
  // Zoom 会议配置
  ZOOM_SETTINGS: {
    host_video: true,
    participant_video: true,
    join_before_host: false,
    mute_upon_entry: true,
    waiting_room: false,
  },
} as const

// ==================== UI配置 ====================
export const UI_CONFIG = {
  // 每页显示的教师数量
  TEACHERS_PER_PAGE: 12,
  
  // 每页显示的预订记录数量
  BOOKINGS_PER_PAGE: 20,
  
  // Dashboard显示的即将到来的课程数量
  UPCOMING_LESSONS_LIMIT: 3,
  
  // 日期格式
  DATE_FORMAT: "PPP", // e.g., "April 29th, 2023"
  TIME_FORMAT: "p",   // e.g., "5:00 PM"
  DATETIME_FORMAT: "PPpp", // e.g., "Apr 29, 2023, 5:00 PM"
} as const

// ==================== 货币配置 ====================
export const CURRENCY_CONFIG = {
  CODE: "USD",
  SYMBOL: "$",
  LOCALE: "en-US",
} as const

