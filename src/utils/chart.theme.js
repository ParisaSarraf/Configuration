export const METRIC_COLORS = {
  planned: "#0ea5e9", // آبی — مقدار برنامه‌ریزی‌شده
  produced: "#10b981", // سبز — مقدار تولید/واقعی شده
  plannedWeight: "#6366f1", // بنفش‌آبی — وزن برنامه‌ریزی‌شده
  produceWeight: "#f97316", // نارنجی — وزن محقق‌شده
  variance: "#f59e0b", // کهربایی — انحراف مقداری
  weightVariance: "#ef4444", // قرمز — انحراف وزنی
  performance: "#a855f7", // بنفش — درصد عملکرد
};

// نسخه‌ی نرم‌تر (برای gradient پس‌زمینه نمودارهای میله‌ای در آینده)
export const METRIC_COLORS_SOFT = {
  planned: "#38bdf8",
  produced: "#34d399",
  plannedWeight: "#818cf8",
  produceWeight: "#fb923c",
  variance: "#fbbf24",
  weightVariance: "#f87171",
  performance: "#c084fc",
};

// رنگ وضعیت‌های موفقیت/هشدار/خطا برای Statistic و Progress — یکپارچه با کل پروژه
export const STATUS_COLORS = {
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  neutral: "#64748b",
};

/** رنگ مناسب (hex) برای درصد تحقق/پیشرفت بر اساس آستانه — برای Statistic، strokeColor و... */
export const getAchievementColor = (percent) => {
  if (percent == null) return STATUS_COLORS.neutral;
  if (percent >= 100) return STATUS_COLORS.success;
  if (percent >= 50) return STATUS_COLORS.warning;
  return STATUS_COLORS.error;
};

/**
 * وضعیت معتبر antd Progress بر اساس همون آستانه‌ها — antd فقط این چهارتا رو قبول می‌کنه:
 * "success" | "exception" | "active" | "normal"  (مقدار hex قبول نمی‌کنه!)
 */
export const getAchievementStatus = (percent) => {
  if (percent == null) return "normal";
  if (percent >= 100) return "success";
  if (percent >= 50) return "active";
  return "exception";
};

/** استایل استاندارد دات (نقطه) روی خطوط نمودار — برای یکدست بودن همه‌ی LineChartها */
export const dotStyle = (color) => ({
  r: 4,
  fill: color,
  strokeWidth: 2,
  stroke: "#fff",
});

/** کوتاه کردن متن بلند بر اساس تعداد کلمه (مثلاً برای توضیحات جدول) */
export const truncateWords = (text, limit = 5) => {
  if (!text) return "—";

  const words = text.split(/\s+/);
  return words.length > limit
    ? `${words.slice(0, limit).join(" ")}...`
    : text;
};
