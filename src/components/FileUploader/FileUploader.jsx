import { Upload, Button, Image } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState, useEffect, useMemo } from "react";

const FileUploader = ({ value = [], onChange, maxFiles = 1 }) => {
    const [fileList, setFileList] = useState([]);

    const normalizedValue = useMemo(() => {
        return Array.isArray(value) ? value : [];
    }, [JSON.stringify(value)]);

    useEffect(() => {
        if (JSON.stringify(fileList) !== JSON.stringify(normalizedValue)) {
            setFileList(normalizedValue);
        }
    }, [normalizedValue]);

    const handleChange = async (info) => {
        const updatedFileList = info.fileList.slice(0, maxFiles);

        const processedFiles = await Promise.all(
            updatedFileList.map(async (file) => {
                if (file.url || file.base64) return file;
                if (file.originFileObj) {
                    return {
                        ...file,
                        base64: await toBase64(file.originFileObj),
                    };
                }
                return file;
            })
        );

        setFileList(processedFiles);
        onChange?.(processedFiles);
    };

    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });

    const handlePreview = async (file) => {
        if (file.url) {
            window.open(file.url, "_blank");
        } else if (file.base64) {
            window.open(file.base64, "_blank");
        } else if (file.originFileObj) {
            const base64 = await toBase64(file.originFileObj);
            window.open(base64, "_blank");
        }
    };

    return (
        <div>
            <Upload
                accept="*/*"
                listType="picture"
                fileList={fileList}
                onChange={handleChange}
                onPreview={handlePreview}
                beforeUpload={() => false}
            >
                {fileList.length < maxFiles && (
                    <Button icon={<UploadOutlined />}>Upload</Button>
                )}
            </Upload>
            {fileList.map((file, index) => (
                <div key={index}>
                    {(file.url || file.base64) && (
                        // <div className="w-full flex flex-row">
                        <Image
                            key={index}
                            src={file.url || file.base64}
                            width={100}
                            style={{ marginTop: 10 }}
                            preview={{ src: file.url || file.base64 }}
                        />
                        // </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default FileUploader;
