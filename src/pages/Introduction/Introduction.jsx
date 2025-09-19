import {useEffect, useRef, useState} from 'react';
import {Button, Card, Col, ConfigProvider, Form, Image, Input, message, Row, Table, Typography} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import fa_IR from 'antd/locale/fa_IR';
import {useProductContext} from '../../Services/Context/ProductContext';
import {useProductChildren, useUpdateProductInfo} from '../../QueryServises/productQuery';
import {BASEURL} from "@/Services/axiosInstance.js";
import FileUploader from '../../components/FileUploader/FileUploader';
import ProductCols from './components/ProductCols';
import DataExporter from "@/components/DataExporter/DataExporter.jsx";

const {Title} = Typography;

const RecursiveTable = ({dataSource, columns}) => (
    <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        pagination={false}
        expandable={{
            indentSize: 20,
            expandIconColumnIndex: 0,
            rowExpandable: (record) => record.children && record.children.length > 0,
        }}
        bordered
    />
);

const Introduction = () => {
    const [form] = Form.useForm();
    const uploaderRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);

    const {currentProduct} = useProductContext();
    const {data: productData, refetch} = useProductChildren(currentProduct?.id);
    const {mutateAsync: updateProductionInfo} = useUpdateProductInfo();

    useEffect(() => {
        if (productData) {
            form.setFieldsValue({
                user_description: productData?.[0]?.user_description,
                user_image: productData?.[0]?.user_image
                    ? [{
                        uid: "-1",
                        name: "user_image",
                        url: BASEURL.replace("/api/v1", "") + productData?.[0].user_image,
                    }]
                    : [],
            });
            setPreviewImage(null);
        }
    }, [productData, form]);

    const handleImageClick = () => {
        if (uploaderRef.current) {
            uploaderRef.current.querySelector('input[type="file"]').click();
        }
    };

    const handleFileChange = (fileList) => {
        form.setFieldsValue({user_image: fileList});
        const newFile = fileList?.[0];
        if (newFile && newFile.originFileObj) {
            setPreviewImage(URL.createObjectURL(newFile.originFileObj));
        } else if (fileList.length === 0) {
            setPreviewImage(null);
        }
    };

    const onFinish = async (values) => {
        const payload = {
            user_image: values?.user_image?.[0]?.originFileObj,
            user_description: values?.user_description,
        }
        try {
            await updateProductionInfo({productId: currentProduct?.id, ...payload});
            message.success('ذخیره با موفقیت انجام شد');
            await refetch();
        } catch (error) {
            message.error("مشکلی در انجام عملیات پیش آمده است");
            console.error(error);
        }
    };

    if (!currentProduct) {
        return <div className="text-center py-8">محصولی یافت نشد</div>;
    }

    const imageSrc = previewImage || (currentProduct?.user_image ? `${BASEURL.replace("/api/v1", "")}${currentProduct.user_image}` : null);

    return (
        <ConfigProvider direction="rtl" locale={fa_IR}>

            <div style={{padding: 16}}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card title={<Title level={4}>{currentProduct?.persian_title}</Title>}>
                            <Form onFinish={onFinish} form={form} layout="vertical" className="w-full">
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Form.Item name="user_description">
                                            <Input.TextArea rows={5} placeholder="توضیحات محصول"
                                                            style={{height: 350, resize: 'none'}}/>
                                        </Form.Item>
                                        <div ref={uploaderRef} style={{display: 'none'}}>
                                            <Form.Item name="user_image">
                                                <FileUploader maxFiles={1} onChange={handleFileChange}/>
                                            </Form.Item>
                                        </div>
                                    </Col>

                                    <Col span={16} className='flex flex-col space-y-16'>
                                        <div className="image-container">
                                            {imageSrc ? (
                                                <Image
                                                    src={imageSrc}
                                                    alt="تصویر محصول"
                                                    height={350}
                                                    style={{width: '100%', objectFit: 'contain'}}
                                                    preview={{
                                                        mask: (
                                                            <div onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleImageClick();
                                                            }}>
                                                                <UploadOutlined/>
                                                                <div style={{marginTop: 8}}>تغییر تصویر</div>
                                                            </div>
                                                        ),
                                                    }}
                                                />
                                            ) : (
                                                <Button type="primary" icon={<UploadOutlined/>}
                                                        onClick={handleImageClick}>
                                                    آپلود تصویر محصول
                                                </Button>
                                            )}
                                        </div>
                                        <Form.Item className='flex justify-end'>
                                            <Button type="primary" htmlType="submit" onClick={onFinish}>
                                                ذخیره تغییرات
                                            </Button>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        </Card>
                    </Col>
                    <Col span={24}>
                        {productData && productData?.length > 0 && (
                            <Card title="محصولات زیرمجموعه" extra={
                                <DataExporter
                                    excelData={productData}
                                    excelColumns={ProductCols()}
                                    fileName="لیست محصولات زیرمجموعه"
                                />
                            }>
                                <RecursiveTable dataSource={productData} columns={ProductCols()}/>
                            </Card>
                        )}
                    </Col>
                </Row>
            </div>
        </ConfigProvider>
    );
};

export default Introduction;