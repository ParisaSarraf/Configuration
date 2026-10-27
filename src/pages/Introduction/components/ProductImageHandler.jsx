import {useEffect, useState} from 'react';
import {Button, Image, message, Upload} from 'antd';
import {DeleteOutlined, UploadOutlined} from '@ant-design/icons';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ProductImageHandler = ({value, onChange, initialImageUrl, onDeleteFromServer, disabled}) => {
    const [previewImage, setPreviewImage] = useState(null);
    const file = value?.[0]?.originFileObj;

    useEffect(() => {
        if (!file) {
            setPreviewImage(null);
            return undefined;
        }
        const objectUrl = URL.createObjectURL(file);
        setPreviewImage(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    const imageSrc = previewImage || (value !== null ? initialImageUrl : null);
    const uploadProps = {
        accept: 'image/jpeg,image/png',
        multiple: false,
        maxCount: 1,
        disabled,
        showUploadList: false,
        beforeUpload: (selectedFile) => {
            if (!['image/jpeg', 'image/png'].includes(selectedFile.type)) {
                message.error('فقط تصویر JPG یا PNG مجاز است.');
                return Upload.LIST_IGNORE;
            }
            if (selectedFile.size > MAX_IMAGE_SIZE) {
                message.error('حجم تصویر نباید بیشتر از ۵ مگابایت باشد.');
                return Upload.LIST_IGNORE;
            }
            onChange?.([{uid: selectedFile.uid, name: selectedFile.name, originFileObj: selectedFile}]);
            return false;
        },
    };

    const handleDelete = async () => {
        if (file) {
            onChange?.([]);
            return;
        }
        try {
            await onDeleteFromServer?.();
            onChange?.(null);
        } catch {
            // The parent displays the server error; retain the current image.
        }
    };

    return imageSrc ? (
        <div className="pw-image-preview">
            <Image src={imageSrc} alt="تصویر محصول"/>
            <div className="pw-image-actions">
                <Upload {...uploadProps}><Button disabled={disabled} icon={<UploadOutlined/>}>تغییر تصویر</Button></Upload>
                <Button disabled={disabled} danger icon={<DeleteOutlined/>} onClick={handleDelete}>
                    {file ? 'لغو انتخاب' : 'حذف تصویر'}
                </Button>
            </div>
        </div>
    ) : (
        <Upload.Dragger {...uploadProps} className="pw-image-dropzone">
            <div className="pw-upload-symbol"><UploadOutlined/></div>
            <strong>تصویر را اینجا رها کنید</strong>
            <p>یا از دستگاه خود انتخاب کنید</p>
            <span className="pw-file-select">انتخاب فایل</span>
            <p className="pw-file-hint">JPG یا PNG، حداکثر ۵ مگابایت</p>
        </Upload.Dragger>
    );
};

export default ProductImageHandler;
