import {Button, message, Space} from 'antd';
import {FileExcelOutlined, FilePdfOutlined} from '@ant-design/icons';
import {exportToExcel} from '@utils/ExportExcel.js';
import {exportToPDF} from "@utils/ExportPDF.js";

const DataExporter = ({excelData, pdfColumns, pdfData, fileName = "export"}) => {

    const handleExcelExport = () => {
        try {
            exportToExcel(excelData, `${fileName}.xlsx`);
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
        <Space>
            <Button
                icon={<FileExcelOutlined/>}
                onClick={handleExcelExport}
                disabled={!excelData || excelData.length === 0}
            >
                خروجی اکسل
            </Button>
            <Button
                icon={<FilePdfOutlined/>}
                onClick={handlePdfExport}
                disabled={!pdfData || pdfData.length === 0}
                danger
            >
                خروجی PDF
            </Button>
        </Space>
    );
};

export default DataExporter;