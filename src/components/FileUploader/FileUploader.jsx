import React, { useState } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';

const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
};

const FileUploader = ({
    name = 'file',
    listType = 'picture-circle',
    action = 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    maxSizeMB = 2,
    allowedTypes = ['image/jpeg', 'image/png'],
    onUploadSuccess,
    onUploadError,
}) => {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState();

    const beforeUpload = (file) => {
        const isAllowedType = allowedTypes.includes(file.type);
        if (!isAllowedType) {
            message.error(`You can only upload ${allowedTypes.join(', ')} files!`);
            return false;
        }
        const isLtMaxSize = file.size / 1024 / 1024 < maxSizeMB;
        if (!isLtMaxSize) {
            message.error(`فایل آپلودی کمتر از ${maxSizeMB}MB است.`);
            return false;
        }
        return isAllowedType && isLtMaxSize;
    };

    const handleChange = (info) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            getBase64(info.file.originFileObj, (url) => {
                setLoading(false);
                setImageUrl(url);
                if (onUploadSuccess) {
                    onUploadSuccess(url);
                }
            });
        } else if (info.file.status === 'error') {
            setLoading(false);
            if (onUploadError) {
                onUploadError('Upload failed');
            }
        }
    };

    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>آپلود تصویر</div>
        </button>
    );

    return (
        <Upload
            name={name}
            listType={listType}
            className="avatar-uploader"
            showUploadList={false}
            action={action}
            beforeUpload={beforeUpload}
            onChange={handleChange}
        >
            {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
        </Upload>
    );
};

export default FileUploader;