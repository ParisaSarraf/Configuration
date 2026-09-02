import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { CalendarOutlined } from "@ant-design/icons";

export default function DatepickerCustom({
  value,
  format = "YYYY-MM-DD",
  onlyYearPicker = false,
  onChange,
  height = "30px",
  width = "100%",
  placeholder = "",
  calendarPosition = "bottom",
  disabled = false,
  className,
  minDate = null,
  maxDate: maxDateProp,
  noMaxDate = false,
}) {
  const today = new DateObject({ calendar: persian });
  // رفتار قبلی دست‌نخورده مانده است: اگر چیزی پاس نشود،
  // سقف انتخاب همان یک سال بعد است. فرم‌ها noMaxDate می‌دهند
  // تا تاریخ‌های دورتر هم قابل انتخاب باشد.
  const maxDate = noMaxDate
    ? undefined
    : (maxDateProp ?? new DateObject({ date: today }).add(1, "year"));

  return (
    <div className="flex items-center justify-between gap-1 border border-[#d9d9d9] hover:border-[#1677ff] focus:border-[#1677ff] rounded-md">
      <DatePicker
        placeholder={placeholder}
        style={{
          width,
          height,
          textAlign: "center",
          fontSize: "15px",
          border: "none",
        }}
        className={className}
        value={value}
        format={onlyYearPicker ? "YYYY" : format}
        onChange={(date) => onChange(date)}
        calendar={persian}
        locale={persian_fa}
        onlyYearPicker={onlyYearPicker}
        calendarPosition={calendarPosition}
        maxDate={maxDate}
        disabled={disabled}
        minDate={minDate}
      />
      <div className="ml-2 mt-1 opacity-25">
        <CalendarOutlined />
      </div>
    </div>
  );
}
