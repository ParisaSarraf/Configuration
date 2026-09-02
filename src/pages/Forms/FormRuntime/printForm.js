// =====================================================================
// printForm — چاپ فقط و فقط همان برگهٔ فرم
//
// مشکل: فرم در عمق چیدمان برنامه (منو، هدر، پنل‌ها، جدول‌ها)
// قرار دارد؛ پس در خروجی چاپ ممکن است فضای خالی یا بخش‌های
// دیگر رابط کاربری بالای فرم بیفتد.
//
// راه‌حل: درست پیش از چاپ، مسیر والدین برگه با کلاس fr-print-keep
// علامت می‌خورد و تمام همسایه‌های این مسیر با fr-print-hide حذف
// می‌شوند. بعد از چاپ همه‌چیز دقیقاً به حالت قبل برمی‌گردد.
//
// مزیت این روش بر clone گرفتن از DOM: متن‌هایی که کاربر در فیلدها
// تایپ کرده است دست نمی‌خورند و در خروجی PDF دیده می‌شوند.
// =====================================================================

const KEEP = "fr-print-keep";
const HIDE = "fr-print-hide";
const TARGET = "fr-print-target";
const PRINTING = "fr-printing";

const resolve = (target) => {
  if (!target) return document.querySelector(".fr-print-area");
  if (typeof target === "string") return document.querySelector(target);
  if (target.current) return target.current;
  if (target.nodeType === 1) return target;
  return document.querySelector(".fr-print-area");
};

export function printForm(target) {
  const node = resolve(target);
  const touched = [];

  const mark = (element, className) => {
    if (!element || element.classList.contains(className)) return;
    element.classList.add(className);
    touched.push([element, className]);
  };

  if (node) {
    mark(node, TARGET);
    let current = node;
    while (current && current !== document.body) {
      const parent = current.parentElement;
      if (!parent) break;
      mark(current, KEEP);
      for (const sibling of Array.from(parent.children)) {
        if (sibling !== current) mark(sibling, HIDE);
      }
      current = parent;
    }
  }

  document.body.classList.add(PRINTING);

  let restored = false;
  const restore = () => {
    if (restored) return;
    restored = true;
    document.body.classList.remove(PRINTING);
    touched.forEach(([element, className]) =>
      element.classList.remove(className),
    );
    window.removeEventListener("afterprint", restore);
  };

  window.addEventListener("afterprint", restore);
  try {
    window.print();
  } finally {
    // بعضی مرورگرها afterprint را دیر یا اصلاً صدا نمی‌زنند.
    setTimeout(restore, 1200);
  }
}

export default printForm;
