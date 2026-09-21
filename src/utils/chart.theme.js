export const METRIC_COLORS = {
 planned: "#315CFF", // آبی — مقدار برنامه‌ریزی‌شده
 produced: "#16A36A", // سبز — مقدار تولید/واقعی شده
 plannedWeight: "#315CFF", // بنفش‌آبی — وزن برنامه‌ریزی‌شده
 produceWeight: "#D97706", // نارنجی — وزن محقق‌شده
 variance: "#D97706", // کهربایی — انحراف مقداری
 weightVariance: "#DC4C4C", // قرمز — انحراف وزنی
 performance: "#315CFF", // بنفش — درصد عملکرد
};

// نسخه‌ی نرم‌تر (برای gradient پس‌زمینه نمودارهای میله‌ای در آینده)
export const METRIC_COLORS_SOFT = {
 planned: "#8AA5FF",
 produced: "#49B98A",
 plannedWeight: "#8AA5FF",
 produceWeight: "#E89A3D",
 variance: "#E6A52A",
 weightVariance: "#E97B76",
 performance: "#8AA5FF",
};

// رنگ وضعیت‌های موفقیت/هشدار/خطا برای Statistic و Progress — یکپارچه با کل پروژه
export const STATUS_COLORS = {
 success: "#16A36A",
 warning: "#D97706",
 error: "#DC4C4C",
 neutral: "#667085",
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
 * "success" | "exception" | "active" | "normal" (مقدار hex قبول نمی‌کنه!)
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
