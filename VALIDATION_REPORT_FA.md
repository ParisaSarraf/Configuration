# گزارش تطبیق فیلدهای فرم با backend

## اصلاحات انجام‌شده

- `form_data` دیگر همهٔ مقدارها را به رشته تبدیل نمی‌کند؛ نوع واقعی JSON حفظ می‌شود.
- `number/rating` عدد، `decimal/currency/slider` عدد، `checkbox` بولین، و فیلدهای چندانتخابی آرایه ارسال می‌شوند.
- `address` مطابق `DictField(child=CharField)` به شکل `{ "address": "..." }` ارسال می‌شود.
- `matrix` به شکل دیکشنری با مقدار رشته‌ای برای هر ردیف ارسال می‌شود.
- `signature` رشته و `date_signature` به‌صورت JSON string سازگار با serializer نوع `SIGNATURE` ارسال می‌شود.
- `sheet_table` از طریق نوع backend یعنی `ADDRESS` و marker رابط کاربری ذخیره می‌شود، چون backend نوع `SHEET_TABLE` را داده‌ای محسوب نمی‌کند.
- فایل‌ها از `form_data` حذف و فقط در مرحلهٔ دوم با `submission_id + field_id + file` آپلود می‌شوند.
- غلط املایی `submiter_id` به `submitter_id` اصلاح شد و `attachments` از payload مرحلهٔ اول حذف شد.
- پس از ایجاد submission، رکورد با endpoint جزئیات دوباره خوانده می‌شود و تک‌تک کلیدهای ارسال‌شده با مقدار ذخیره‌شده مقایسه می‌شوند.
- همین کنترل در مسیر عادی فرم و در شروع فرایند فعال شده است؛ در شروع فرایند، mismatch مانع ساخت Request می‌شود.

## قرارداد فیلدها

| نوع فیلد | مقدار ارسالی در `form_data` |
|---|---|
| text / textarea / phone / email / url / time | string |
| number / rating | number (integer) |
| decimal / currency / slider | number |
| date / datetime | string استاندارد میلادی |
| select / radio / country | string (value گزینه) |
| checkbox | boolean |
| checkboxes / multiselect / multiselect_list | array |
| address | object با childهای string |
| matrix | object با childهای string |
| signature | string |
| date_signature | JSON string |
| file / multifile | خارج از `form_data`؛ multipart جداگانه |
| sheet_table | object؛ در backend با نوع ADDRESS ذخیره می‌شود |
| فیلدهای نمایشی | ارسال نمی‌شوند |

## نکتهٔ مهاجرت

فیلدهای `sheet_table` قدیمی که قبلاً با همان `field_type=sheet_table` روی سرور ذخیره شده‌اند باید یک‌بار در فرم‌ساز ذخیره/همگام شوند تا به `field_type=address` همراه marker `el-sheet-table` تبدیل شوند؛ در غیر این صورت backend فعلی آن‌ها را در `NON_DATA_FIELD_TYPES` نادیده می‌گیرد.
