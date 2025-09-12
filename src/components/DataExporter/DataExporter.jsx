import {Button, message, Space} from 'antd';
import {FileExcelOutlined, FilePdfOutlined} from '@ant-design/icons';
import {exportToExcel} from '@utils/ExportExcel.js';
import {exportToPDF} from "@utils/ExportPDF.js";

const DataExporter = ({excelData, excelColumns, pdfColumns, pdfData, fileName = "export"}) => {

    const handleExcelExport = () => {
        try {
            exportToExcel(excelData, excelColumns, `${fileName}.xlsx`);
            message.success("خروجی اکسل با موفقیت دانلود شد");
        } catch (error) {
            message.error("خطا در ایجاد خروجی اکسل");
            console.error("Excel export error:", error);
        }
    };

    const handlePdfExport = () => {
        try {
            exportToPDF(pdfColumns, pdfData, `${fileName}.pdf`);
            message.success("خروجی PDF با موفقیت دانلود شد");
        } catch (error) {
            message.error("خطا در ایجاد خروجی PDF");
            console.error("PDF export error:", error);
        }
    };

    return (
        <Space className="w-full flex flex-row mb-2 justify-end">
            <Button
                icon={<FileExcelOutlined/>}
                onClick={handleExcelExport}
                disabled={!excelData || excelData?.length === 0}
                className={'text-green-500 border-green-500'}
                title={'گزارش گیری اکسل'}
            />
            <Button
                icon={<FilePdfOutlined/>}
                onClick={handlePdfExport}
                disabled={!pdfData || pdfData?.length === 0}
                danger
                title={'گزارش گیری PDF'}
            />
        </Space>
    );
};

export default DataExporter;