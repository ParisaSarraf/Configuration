import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import VazirmatnNormal from "../../public/fonts/VazirmatnNormal.js";

export const exportToPDF = (columns, data, fileName = "export.pdf") => {
    const doc = new jsPDF({orientation: "portrait", unit: "pt", format: "a4"});

    doc.addFileToVFS("Vazirmatn-Regular.ttf", VazirmatnNormal);
    doc.addFont("Vazirmatn-Regular.ttf", "Vazirmatn", "normal");
    doc.setFont("Vazirmatn");


    const tableHeaders = columns.map(col => col.title);
    const tableBody = data.map(row =>
        columns.map(col =>
            Array.isArray(col.dataIndex)
                ? col.dataIndex.reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : ""), row)
                : row[col.dataIndex] || ""
        )
    );

    autoTable(doc, {
        head: [tableHeaders],
        body: tableBody,
        styles: {
            font: "Vazirmatn",
            fontSize: 11,
            halign: "right",
            cellPadding: 5,
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: "bold",
            halign: "center",
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245],
        },
        tableLineWidth: 0.5,
        tableLineColor: 200,
        startY: 20,
        margin: {top: 30, right: 20, left: 20, bottom: 20},
        pageBreak: 'auto',
        columnStyles: columns.reduce((acc, col, idx) => {
            acc[idx] = {cellWidth: 'wrap'};
            return acc;
        }, {}),
    });

    doc.save(fileName);
};
