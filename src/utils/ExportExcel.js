import * as XLSX from "xlsx";
import {saveAs} from "file-saver";

const transformDataForExport = (data, columns) => {
    const exportableColumns = columns?.filter(col => col.key !== 'actions' && col.key !== 'index');

    const headers = exportableColumns.map(col => col.title);

    const rows = data.map((record, recordIndex) => {
        const rowData = {};
        exportableColumns.forEach(col => {
            let cellValue;

            if (col.render) {
                const renderOutput = col.render(record[col.dataIndex], record, recordIndex);

                if (typeof renderOutput === 'object' && renderOutput !== null && renderOutput.props) {
                    const children = renderOutput.props.children || renderOutput.props.title;
                    cellValue = typeof children === 'object' ? children.props.children : children;
                } else {
                    cellValue = renderOutput;
                }

            } else if (col.dataIndex) {
                cellValue = Array.isArray(col.dataIndex)
                    ? col.dataIndex.reduce((acc, key) => acc && acc[key] ? acc[key] : '', record)
                    : record[col.dataIndex];
            }

            rowData[col.title] = cellValue !== null && cellValue !== undefined ? cellValue : '';
        });
        return rowData;
    });

    return rows;
};

export const exportToExcel = (data, columns, fileName = "export.xlsx", rtl = true) => {
    if (!data || !columns) return;

    const transformedData = transformDataForExport(data, columns);

    const ws = XLSX.utils.json_to_sheet(transformedData);

    if (rtl) {
        ws["!cols"] = [];
        ws["!rows"] = [];
        // ws['!protect'] = {sheet: true};
        ws['!autofilter'] = {ref: XLSX.utils.encode_range(XLSX.utils.decode_range(ws['!ref']))};

        if (!ws['!view']) ws['!view'] = {};
        ws['!view'].RTL = true;

        Object.keys(ws).forEach((cell) => {
            if (cell[0] === "!") return;
            if (!ws[cell].s) ws[cell].s = {};
            ws[cell].s.alignment = {horizontal: "right", vertical: "center"};
            ws[cell].s.font = {name: "Tahoma", sz: 11};
        });
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "گزارش");
    const wbout = XLSX.write(wb, {bookType: "xlsx", type: "array"});
    saveAs(new Blob([wbout], {type: "application/octet-stream"}), fileName);
};