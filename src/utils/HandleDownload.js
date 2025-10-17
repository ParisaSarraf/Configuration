import {message} from "antd";

export const handleDownload = (blobUrl, fileName, resetExportState) => {
    try {
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
        }, 100);

        message.success("فایل با موفقیت دانلود شد");
        if (resetExportState) {
            resetExportState(null);
        }

    } catch (error) {
        message.error("دانلود فایل با خطا مواجه شد");
        console.error('Download error:', error);
    }
};