// =====================================================================
// imageTool — انتخاب و آماده‌سازی تصویر لوگو
//
// چون API آپلود فایل هنوز آماده نیست، تصویر انتخابی کوچک می‌شود و به
// شکل data URL در default_value ذخیره می‌شود؛ هر وقت endpoint آپلود
// آماده شد فقط readImageFile جایش را به آپلود می‌دهد و بقیهٔ کد
// دست‌نخورده می‌ماند.
// =====================================================================

/** سقف انتخاب فایل از سیستم کاربر. */
export const MAX_PICK_BYTES = 4 * 1024 * 1024;

/** بیش از این حجم برای ذخیره در ستون متنی پایگاه داده زیاد است. */
export const WARN_BYTES = 60 * 1024;

export const isDataUrl = (src) =>
  typeof src === "string" && src.startsWith("data:");

/** حجم تقریبی یک data URL بر حسب بایت. */
export const approxBytes = (src) => {
  if (!isDataUrl(src)) return 0;
  const base64 = src.slice(src.indexOf(",") + 1);
  return Math.round((base64.length * 3) / 4);
};

export const formatBytes = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} بایت`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} کیلوبایت`;
  return `${(bytes / 1024 / 1024).toFixed(1)} مگابایت`;
};

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("خواندن فایل ممکن نشد"));
    reader.readAsDataURL(file);
  });

/** کوچک‌سازی تصویر با canvas تا حجم ذخیره‌سازی کم بماند. */
const shrink = (dataUrl, maxWidth, maxHeight) =>
  new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const width = image.width || 0;
      const height = image.height || 0;
      const scale = Math.min(
        1,
        maxWidth / (width || 1),
        maxHeight / (height || 1),
      );
      if (!width || !height || scale >= 1) {
        resolve(dataUrl);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        resolve(dataUrl);
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      try {
        const next = canvas.toDataURL("image/png");
        resolve(next.length < dataUrl.length ? next : dataUrl);
      } catch {
        resolve(dataUrl);
      }
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });

/**
 * خواندن فایل تصویری و برگرداندن { src, name, bytes }.
 * SVG دست‌نخورده می‌ماند (حجمش کم است و کوچک‌سازی کیفیتش را خراب می‌کند).
 */
export const readImageFile = async (file, options = {}) => {
  const { maxWidth = 420, maxHeight = 160 } = options;
  if (!file) throw new Error("فایلی انتخاب نشد");
  if (!String(file.type || "").startsWith("image/"))
    throw new Error("فقط فایل تصویری مجاز است (PNG، JPG یا SVG)");
  if (file.size > MAX_PICK_BYTES)
    throw new Error("حجم تصویر باید کمتر از ۴ مگابایت باشد");

  const raw = await readAsDataUrl(file);
  const src =
    file.type === "image/svg+xml"
      ? raw
      : await shrink(raw, maxWidth, maxHeight);

  return { src, name: file.name || "logo", bytes: approxBytes(src) };
};
