import * as XLSX from "xlsx";
import {saveAs} from "file-saver";


const flattenTree = (data, parentField = "parent", parentValue = "ندارد") => {
    let rows = [];

    if (Array.isArray(data)) {
        data.forEach((item) => {
            rows = rows.concat(flattenTree(item, parentField, parentValue));
        });
    } else if (typeof data === "object" && data !== null) {
        const {children, ...rest} = data;
        const row = {...rest, [parentField]: parentValue};
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

export const exportToExcel = (data, fileName = "export.xlsx", rtl = true) => {
    if (!data) return;
    const allRows = flattenTree(data);
    const finalRows = rtl
        ? allRows.map((row) => {
            const keys = Object.keys(row).reverse();
            return keys.reduce((obj, key) => {
                obj[key] = row[key];
                return obj;
            }, {});
        })
        : allRows;

    const ws = XLSX.utils.json_to_sheet(finalRows);

    Object.keys(ws).forEach((cell) => {
        if (cell[0] === "!") return;
        if (!ws[cell].s) ws[cell].s = {};
        ws[cell].s.alignment = {horizontal: rtl ? "right" : "left"};
        ws[cell].s.font = {name: "B Nazanin"};
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "لیست اسناد");
    const wbout = XLSX.write(wb, {bookType: "xlsx", type: "array"});
    saveAs(new Blob([wbout], {type: "application/octet-stream"}), fileName);
};
