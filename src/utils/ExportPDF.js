import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

jsPDF.autoTable = autoTable;

export const exportToPDF = (columns, data, fileName = "export.pdf") => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.error("No data to export or data is not an array");
        return;
    }

    const doc = new jsPDF();

    doc.setFont('helvetica');
    doc.setFontSize(10);

    const tableHeaders = columns.map(col => col.title);
    const tableBody = data.map(row => {
        return columns.map(col => {
            if (Array.isArray(col.dataIndex)) {
                return col.dataIndex.reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : '', row);
            }
            return row[col.dataIndex] || '';
        });
    });

    doc.autoTable({
        head: [tableHeaders],
        body: tableBody,
        styles: {
            font: 'helvetica',
            fontSize: 10,
            cellPadding: 3
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240]
        }
    });

    doc.save(fileName);
};