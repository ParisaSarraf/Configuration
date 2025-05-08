import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default function DatepickerCustom({
    label,
    value,
    format = "YYYY-MM-DD",
    onlyYearPicker = false,
    onChange,
    height = "30px",
    width = "100%",
    placeholder = "",
    style = {},
    calendarPosition = "bottom",
    disabled = false,
    className,
}) {
    const today = new Date();
    const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 365);
    const getDateStringFromDateObject = (date) => {
        const year = date.year.toString();
        let month = date.month.number.toString();
        let day = date.day.toString();

        if (month.length === 1) {
            month = '0' + month;
        }
        if (day.length === 1) {
            day = '0' + day;
        }
        return year + '/' + month + '/' + day;
    };

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <DatePicker
                placeholder={placeholder}
                style={{
                    width,
                    height,
                    textAlign: "center",
                    fontSize: "15px",
                }}
                className={`${className}`}
                value={value || undefined}
                format={onlyYearPicker ? 'YYYY' : format}
                mapDays={({ date }) => {
                    const props = {};

                    if (date.weekDay.index === 6) {
                        props.className = 'highlight highlight-red';
                    }

                    return props;
                }}
                onChange={(date) => {
                    onChange(getDateStringFromDateObject(date));
                }}
                calendar={persian}
                locale={persian_fa}
                onlyYearPicker={onlyYearPicker}
                calendarPosition={calendarPosition}
                maxDate={maxDate}
                disabled={disabled}
                
            />
          
        </div>
    );
}