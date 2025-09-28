import { useState, useRef, useEffect } from 'react';
import { Button, Image } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import FileUploader from '../../../components/FileUploader/FileUploader';

const ProductImageHandler = ({ value, onChange, initialImageUrl, onDeleteFromServer }) => {
    const [previewImage, setPreviewImage] = useState(null);
    const uploaderRef = useRef(null);

    useEffect(() => {
        setPreviewImage(null);
    }, [initialImageUrl]);


    const imageSrc = previewImage || (initialImageUrl && !value?.[0]?.originFileObj ? initialImageUrl : null);

    const handleImageClick = () => {
        uploaderRef.current?.querySelector('input[type="file"]').click();
    };

    const handleFileChange = (fileList) => {
        const newFile = fileList?.[0];
        if (newFile?.originFileObj) {
            setPreviewImage(URL.createObjectURL(newFile.originFileObj));
            onChange(fileList);
        } else if (fileList.length === 0) {
            setPreviewImage(null);
            onChange([]);
        }
    };

    const handleDeleteClick = async () => {
        if (onDeleteFromServer) {
            await onDeleteFromServer();
        }
        setPreviewImage(null);
        onChange(null);
    };

    return (
        <div className="image-container flex flex-col items-center justify-center h-full">
            <div ref={uploaderRef} style={{ display: 'none' }}>
                <FileUploader maxFiles={1} onChange={handleFileChange} fileList={value || []} />
            </div>

            {imageSrc ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    backgroundColor: '#f5f5f5',
                    padding: '20px 0'
                }}>
                    <div style={{
                        maxWidth: '100%',
                        maxHeight: 350,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Image
                            src={imageSrc}
                            alt="تصویر محصول"
                            height={350}
                            style={{
                                maxWidth: '100%',
                                maxHeight: 350,
                                objectFit: 'contain',
                                display: 'block'
                            }}
                            preview={{
                                mask: (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '16px',
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                                    }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                padding: '12px 20px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                borderRadius: '8px',
                                                transition: 'all 0.3s',
                                                minWidth: 100
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                            onClick={(e) => { e.stopPropagation(); handleImageClick(); }}
                                        >
                                            <UploadOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                                            <div style={{ marginTop: 6, fontSize: '14px', color: '#1890ff', fontWeight: '500' }}>تغییر تصویر</div>
                                        </div>

                                        <Button
                                            type="primary"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(); }}
                                            style={{
                                                padding: '12px 20px',
                                                height: 'auto',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minWidth: 100,
                                                borderRadius: '8px'
                                            }}
                                        >
                                            <div style={{ fontSize: '14px', lineHeight: '1.2', fontWeight: '500' }}>حذف تصویر</div>
                                        </Button>
                                    </div>
                                ),
                            }}
                        />
                    </div>
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    backgroundColor: '#f5f5f5',
                    padding: '20px 0'
                }}>
                    <Button
                        type="dashed"
                        icon={<UploadOutlined />}
                        onClick={handleImageClick}
                        style={{
                            height: 350,
                            width: '100%',
                            maxWidth: 400,
                            fontSize: '16px'
                        }}
                    >
                        آپلود تصویر محصول
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ProductImageHandler;