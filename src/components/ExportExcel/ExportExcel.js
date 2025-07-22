import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const flattenData = (product, parentTitle = "") => {
	const row = {
		کد: product.code,
		عنوان: product.persian_title,
		"کد والد": parentTitle || "ندارد",
		توضیحات: product.description,
		قیمت: product.price,
		"برند 1": product.brand1,
		"برند 2": product.brand2,
	};

	let rows = [row];

	if (product.children && product.children.length > 0) {
		product.children.forEach((child) => {
			rows = rows.concat(flattenData(child, product.persian_title));
		});
	}

	return rows;
};

export const exportToExcel = (productData) => {
	if (!productData) return;

	// ساخت داده‌های نهایی
	const allRows = flattenData(productData);

	// ایجاد شیت
	const ws = XLSX.utils.json_to_sheet(allRows);

	// راست‌چین کردن متن‌ها
	Object.keys(ws).forEach((cell) => {
		if (cell[0] === "!") return;
		ws[cell].s = {
			alignment: { horizontal: "right" },
			font: { name: "B Nazanin" },
		};
	});

	// ایجاد فایل اکسل
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, "محصولات");

	// دانلود فایل
	const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
	saveAs(
		new Blob([wbout], { type: "application/octet-stream" }),
		"products.xlsx"
	);
};
