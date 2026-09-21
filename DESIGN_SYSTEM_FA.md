# Design System واحد «مسیر»

این پروژه فقط یک تم ثابت دارد. منبع اصلی توکن‌ها `src/styles/design-system.css` است و تنظیمات هماهنگ Tailwind و Ant Design به‌ترتیب در `tailwind.config.js` و `src/App.jsx` قرار دارند.

## پالت ثابت
- Primary: `#315CFF` — اکشن اصلی، لینک، focus و info
- Secondary: `#0F9D8A` — تأکید ثانویه و نمودارها
- Success: `#16A36A`
- Warning: `#D97706`
- Error: `#DC4C4C`
- Canvas: `#F5F7FA`
- Surface: `#FFFFFF`
- Primary text: `#172033`
- Secondary text: `#667085`
- Border: `#E3E8EF`

تمام رنگ‌های پراکنده‌ی قبلی به خانواده‌های محدود `blue / emerald / amber / red / slate` تبدیل شده‌اند.

## تایپوگرافی
فونت واحد: Vazir/Vazirmatn
- Caption: 12px
- Body: 14px
- Subtitle: 16px
- Title: 20px
- Display: 26px

## فاصله‌گذاری
Grid پایه 4px: `4, 8, 12, 16, 20, 24, 32, 40, 48`.

## شکل و ارتفاع
- Radius کوچک: 6px
- Radius کنترل: 10px
- Radius سطح بزرگ: 12px
- ارتفاع کنترل دسکتاپ: 36px
- حداقل هدف لمسی موبایل: 44px
- Shadowها فقط در سه سطح کم، متوسط و raised استفاده می‌شوند.

## وضعیت‌های داده
- نوار loading سراسری برای React Query
- پیام فارسی قابل‌فهم برای خطاها
- Retry در خطاهای query
- Empty state سراسری
- Error Boundary برای جلوگیری از کرش کامل UI
- بنر قطع اتصال اینترنت

## قید معماری
تغییرات صرفاً در لایه UI/UX هستند؛ منطق تجاری، state management و قرارداد API تغییر نکرده‌اند.
