import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * تابعی برای فلت کردن داده‌های تو درختی
 * @param {Object|Array} data - داده اصلی (می‌تواند آبجکت یا آرایه باشد)
 * @param {String} parentField - نام فیلدی که والد را نشان می‌دهد
 * @param {String} parentValue - مقدار والد فعلی
 * @returns {Array} - آرایه‌ای از آبجکت‌های فلت‌شده
 */
const flattenTree = (data, parentField = "parent", parentValue = "ندارد") => {
	let rows = [];

	if (Array.isArray(data)) {
		data.forEach((item) => {
			rows = rows.concat(flattenTree(item, parentField, parentValue));
		});
	} else if (typeof data === "object" && data !== null) {
		const { children, ...rest } = data;
		const row = { ...rest, [parentField]: parentValue };
		rows.push(row);

		if (children && children.length > 0) {
			children.forEach((child) => {
				rows = rows.concat(
					flattenTree(
						child,
						parentField,
						data.persian_title || data.name || "ناشناخته"
					)
				);
			});
		}
	}

	return rows;
};

/**
 * تابع خروجی اکسل
 * @param {Object|Array} data - داده ورودی (می‌تواند یک آبجکت یا آرایه از آبجکت‌ها باشد)
 * @param {String} fileName - نام فایل خروجی
 * @param {Boolean} rtl - آیا اکسل راست‌چین باشد؟
 */
export const exportToExcel = (data, fileName = "export.xlsx", rtl = true) => {
	if (!data) return;

	// فلت کردن داده‌ها (در صورت وجود children)
	const allRows = flattenTree(data);

	// معکوس کردن کلیدها برای نمایش راست به چپ
	const finalRows = rtl
		? allRows.map((row) => {
				const keys = Object.keys(row).reverse();
				return keys.reduce((obj, key) => {
					obj[key] = row[key];
					return obj;
				}, {});
		  })
		: allRows;

	// ایجاد شیت اکسل
	const ws = XLSX.utils.json_to_sheet(finalRows);

	// استایل‌دهی
	Object.keys(ws).forEach((cell) => {
		if (cell[0] === "!") return;
		if (!ws[cell].s) ws[cell].s = {};
		ws[cell].s.alignment = { horizontal: rtl ? "right" : "left" };
		ws[cell].s.font = { name: "B Nazanin" };
	});

	// ایجاد ورک‌بوک
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

	// خروجی گرفتن
	const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
	saveAs(new Blob([wbout], { type: "application/octet-stream" }), fileName);
};
