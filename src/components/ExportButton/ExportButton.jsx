import { Button } from 'antd';
import React from 'react';
import * as XLSX from 'xlsx';

const ExportButton = ({ data, filename }) => {

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;


        ws[cellAddress].s = ws[cellAddress].s || {};
        ws[cellAddress].s.alignment = ws[cellAddress].s.alignment || {};
        ws[cellAddress].s.alignment.horizontal = 'right';
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };


  const exportToCSV = () => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csvContent = `${headers}\n${rows.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };


  const handleExport = () => {
    const format = prompt('لطفاً فرمت خروجی را انتخاب کنید (csv یا excel):').toLowerCase();
    if (format === 'csv') {
      exportToCSV();
    } else if (format === 'excel') {
      exportToExcel();
    } else {
      alert('فرمت نامعتبر! لطفاً "csv" یا "excel" وارد کنید.');
    }
  };

  return (
    <Button
      onClick={handleExport}
      className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
    >
      گزارش
    </Button>
  );
};

export default ExportButton;