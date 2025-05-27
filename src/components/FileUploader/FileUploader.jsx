import { Upload, Image } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";

const FileUploader = ({ value = [], onChange, maxFiles = 1, listType, className }) => {
    const [fileList, setFileList] = useState(value);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        // Only update if the incoming value is different from current fileList
        if (JSON.stringify(value) !== JSON.stringify(fileList)) {
            setFileList(value);
        }
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = async (info) => {
        const updatedFileList = info.fileList.slice(0, maxFiles);

        const base64Files = await Promise.all(
            updatedFileList.map(async (file) => {
                if (!file.originFileObj) return file;
                const base64 = await toBase64(file.originFileObj);
                return { ...file, base64 };
            })
        );

        setFileList(base64Files);
        onChange?.(base64Files);
    };

    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });

    const handlePreview = async (file) => {
        if (!file.base64 && file.originFileObj) {
            file.base64 = await toBase64(file.originFileObj);
        }
        setPreviewImage(file.base64 || file.url);
    };

    return (
        <div>
            <Upload
                className={className}
                listType={listType}
                fileList={fileList}
                onChange={handleChange}
                onPreview={handlePreview}
                beforeUpload={() => false}
            >
                {fileList.length < maxFiles && (
                    <span>
                        آپلود <UploadOutlined />
                    </span>
                )}
            </Upload>

            {previewImage && (
                <Image
                    src={previewImage}
                    style={{ display: "none" }}
                    preview={{
                        visible: !!previewImage,
                        onVisibleChange: (visible) => {
                            if (!visible) setPreviewImage(null);
                        },
                    }}
                />
            )}
        </div>
    );
};

export default FileUploader;