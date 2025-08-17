import {useProductContext} from '../../Services/Context/ProductContext';
import {Button, Card, Col, ConfigProvider, Form, Image, Input, message, Row, Table, Typography,} from 'antd';
import fa_IR from 'antd/locale/fa_IR';
import {BASEURL} from "@/Services/axiosInstance.js";
import ProductCols from './components/ProductCols';
import {useProductChildren, useUpdateProductInfo} from '../../QueryServises/productQuery';
import {useEffect} from 'react';
import FileUploader from '../../components/FileUploader/FileUploader';

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
    />
);

const Introduction = () => {
    const {currentProduct} = useProductContext();
    const {data: productData, refetch} = useProductChildren(currentProduct?.id)
    const [form] = Form.useForm();
    const {mutateAsync: updateProductionInfo} = useUpdateProductInfo();


    useEffect(() => {
        if (productData) {
            form.setFieldsValue({
                user_description: productData.user_description || '',
                user_image: productData.user_image
                    ? [
                        {
                            uid: "-1",
                            name: "user_image",
                            url: BASEURL.replace("/api/v1", "") + productData.user_image,
                        },
                    ]
                    : [],
            });
        }
    }, [productData]);

    if (!productData) {
        return <div className="text-center py-8">محصولی یافت نشد</div>;
    }
    const onFinish = async (values) => {
        const formData = new FormData();
        if (values.user_description) {
            formData.append('user_description', values.user_description);
        }
        const file = values.user_image?.[0]?.originFileObj;
        if (file) {
            formData.append('user_image', file);
        }
        try {
            await updateProductionInfo({
                productId: currentProduct?.id,
                ProductInfoData: formData,
            });
            message.success('ذخیره با موفقیت انجام شد');
            await refetch()
            form.resetFields()
        } catch (error) {
            message.error("مشکلی در انجام عملیات پیش آمده است");
            console.error(error);
        }
    };


    return (
        <ConfigProvider direction="rtl" locale={fa_IR}>
            <div style={{padding: 16}}>
                <Card className="-mb-8">
                    <Row gutter={16}>
                        <Col span={24}>
                            <Title level={4}>{productData?.persian_title}</Title>
                        </Col>
                        <Col span={24}>
                            <Form
                                onFinish={onFinish}
                                form={form}
                                layout="vertical"
                                className="w-full"
                            >
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Form.Item
                                            name="user_description"
                                        >
                                            <Input.TextArea
                                                rows={5}
                                                placeholder="توضیحات محصول"
                                                style={{
                                                    height: 350,
                                                    resize: 'none',
                                                }}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            name="user_image"
                                            label="آپلود تصویر جدید"
                                        >
                                            <FileUploader maxFiles={1} listType="picture"/>
                                        </Form.Item>

                                    </Col>

                                    <Col span={16} className='flex flex-col space-y-16 '>
                                        {productData.user_image && (
                                            <Image
                                                src={`${BASEURL.replace("/api/v1", "")}${productData.user_image}`}
                                                alt="تصویر محصول"
                                                style={{
                                                    height: 350,
                                                    width: 930,
                                                    objectFit: 'contain',
                                                    backgroundColor: '#E2E2E2',
                                                    borderRadius: 4,
                                                }}
                                            />
                                        )}
                                        <Form.Item className='flex justify-end'>
                                            <Button type="primary" htmlType="submit">
                                                ذخیره تغییرات
                                            </Button>
                                        </Form.Item>
                                    </Col>
                                </Row>

                            </Form>
                        </Col>
                    </Row>
                </Card>

                {productData && (
                    <Card title="محصولات زیرمجموعه">
                        <RecursiveTable
                            dataSource={productData}
                            columns={ProductCols()}
                        />
                    </Card>
                )}
            </div>
        </ConfigProvider>
    );
};

export default Introduction;
