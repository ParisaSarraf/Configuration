/* eslint-disable react/prop-types */
// =====================================================================
// DateField — تمام تاریخ‌های فرم از همین یک جا می‌آیند.
//
//  • تقویم/ظاهر: همان DatePicker خود پروژه
//    (src/components/DatePicker/index.jsx — react-multi-date-picker با
//     تقویم persian و زبان persian_fa)
//  • تبدیل شمسی ↔ میلادی: فقط و فقط با توابع utils/timeTool
//    (georgianDateToJalaliDate / jalaliDateToGeorgianDate /
//     jalaliDateTimeToGeorgianDateTime / georgianDateTimeToTime /
//     getValidTimeFromTimeString)
//  • قاعدهٔ ثابت: کاربر شمسی می‌بیند و شمسی انتخاب می‌کند،
//    اما مقداری که در submission ذخیره می‌شود همیشه میلادی ISO است:
//        date      → "YYYY-MM-DD"
//        datetime  → "YYYY-MM-DDTHH:mm:ss"
//        time      → "HH:mm"
// =====================================================================

import DatepickerCustom from "../../../components/DatePicker/index.jsx";
import {
  georgianDateToJalaliDate,
  georgianDateTimeToTime,
  getValidTimeFromTimeString,
  jalaliDateTimeToGeorgianDateTime,
  jalaliDateToGeorgianDate,
} from "../../../utils/timeTool";

const JALALI = /^\d{4}\/\d{1,2}\/\d{1,2}$/;
const GREGORIAN = /^\d{4}-\d{2}-\d{2}$/;

/** moment برای ورودی نامعتبر رشتهٔ "Invalid date" می‌دهد؛ ردش می‌کنیم. */
const ok = (text) =>
  text && !String(text).includes("Invalid") ? String(text) : "";

/** مقدار ذخیره‌شده (میلادی) ← رشتهٔ شمسی برای نمایش در تقویم */
export const toJalaliText = (stored) => {
  const raw = String(stored || "").trim().slice(0, 10);
  if (!raw) return "";
  if (JALALI.test(raw)) return raw; // از قبل شمسی ذخیره شده بود
  if (!GREGORIAN.test(raw)) return "";
  return ok(georgianDateToJalaliDate(raw));
};

/** رشتهٔ شمسی تقویم → تاریخ میلادی ISO */
export const toGregorianText = (jalali) => {
  const raw = String(jalali || "").trim();
  if (!raw) return "";
  if (GREGORIAN.test(raw)) return raw;
  return ok(jalaliDateToGeorgianDate(raw));
};

/** ساعت را از مقدار ذخیره‌شده درمی‌آورد (هم "HH:mm" هم ISO کامل) */
const timeOf = (stored) => {
  const raw = String(stored || "").trim();
  if (!raw) return "";
  if (/^\d{1,2}:\d{2}/.test(raw)) return raw.slice(0, 5);
  return ok(georgianDateTimeToTime(raw)).slice(0, 5);
};

/** DateObject خروجی تقویم → "YYYY/MM/DD" شمسی با ارقام لاتین */
const pickedToJalali = (picked) => {
  if (!picked) return "";
  if (typeof picked === "string") return picked.trim();
  const year = picked.year;
  if (!year) return "";
  const month = String(picked.month?.number ?? picked.month ?? 1).padStart(2, "0");
  const day = String(picked.day ?? 1).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

export default function DateField({
  mode = "date",
  value,
  onChange,
  readOnly = false,
  invalid = false,
  placeholder = "",
}) {
  const jalali = toJalaliText(value);
  const time = timeOf(value);

  const emit = (nextJalali, nextTime) => {
    if (readOnly) return;

    if (mode === "time") {
      onChange?.(nextTime ? ok(getValidTimeFromTimeString(nextTime)) : "");
      return;
    }

    if (!nextJalali) {
      onChange?.("");
      return;
    }

    if (mode === "datetime") {
      onChange?.(
        ok(
          jalaliDateTimeToGeorgianDateTime(
            `${nextJalali}T${nextTime || "00:00"}`,
          ),
        ),
      );
      return;
    }

    onChange?.(toGregorianText(nextJalali));
  };

  /* ------------------------- فقط ساعت ------------------------- */
  if (mode === "time")
    return (
      <input
        className={`fr-input fr-timeinput${invalid ? " is-invalid" : ""}`}
        type="time"
        value={time}
        disabled={readOnly}
        onChange={(event) => emit("", event.target.value)}
      />
    );

  /* --------------------- تاریخ / تاریخ و ساعت --------------------- */
  return (
    <div className={`fr-datefield${invalid ? " is-invalid" : ""}`}>
      <div className="fr-datefield-picker">
        <DatepickerCustom
          value={jalali}
          format="YYYY/MM/DD"
          placeholder={placeholder || "انتخاب تاریخ"}
          height="32px"
          disabled={readOnly}
          noMaxDate
          onChange={(picked) => emit(pickedToJalali(picked), time)}
        />
      </div>

      {mode === "datetime" && (
        <input
          className="fr-input fr-timeinput"
          type="time"
          value={time}
          disabled={readOnly}
          onChange={(event) => emit(jalali, event.target.value)}
        />
      )}

      {!readOnly && jalali && (
        <span className="fr-datefield-hint fr-no-print">
          {mode === "datetime"
            ? String(value || "").slice(0, 16).replace("T", " ")
            : toGregorianText(jalali)}
        </span>
      )}
    </div>
  );
}
