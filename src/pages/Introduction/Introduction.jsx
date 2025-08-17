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
    const [form] = Form.useForm();

    const {currentProduct} = useProductContext();
    const {data: productData} = useProductChildren(currentProduct?.id)
    const {mutateAsync: updateProductionInfo} = useUpdateProductInfo();

    useEffect(() => {
        if (currentProduct?.productData) {
            form.setFieldsValue({
                user_description: currentProduct?.productData?.user_description || '',
                user_image: currentProduct?.productData?.user_image
                    ? [
                        {
                            uid: "-1",
                            name: "user_image",
                            url: BASEURL.replace("/api/v1", "") + currentProduct?.productData?.user_image,
                        },
                    ]
                    : [],
            });
        }
    }, [currentProduct, form, currentProduct?.productData?.user_image]);

    if (!currentProduct) {
        return <div className="text-center py-8">محصولی یافت نشد</div>;
    }

    const onFinish = async (values) => {
        const payload = {
            user_description: values.user_description,
            user_image: values.user_image?.[0]?.originFileObj,
        }
        try {
            await updateProductionInfo(
            {productId: currentProduct?.id,...payload});
            message.success('ذخیره با موفقیت انجام شد');
            // await refetch()
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
                            <Title level={4}>{currentProduct?.persian_title}</Title>
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
                                        {currentProduct?.productData?.user_image && (
                                            <Image
                                                src={`${BASEURL.replace("/api/v1", "")}${currentProduct?.productData?.user_image}`}
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
