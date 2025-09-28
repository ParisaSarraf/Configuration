import { useEffect } from 'react';
import { Button, Card, Col, Form, Input, Row, Typography } from 'antd';
import ProductImageHandler from './ProductImageHandler';
import { BASEURL } from "@/Services/axiosInstance.js";

const { Title } = Typography;

const ProductInfoForm = ({ product, onFinish, onDeleteImage, isSubmitting }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (product) {
            form.setFieldsValue({
                user_description: product.user_description,
                user_image: [],
            });
        }
    }, [product, form]);

    const initialImageUrl = product?.user_image
        ? `${BASEURL.replace("/api/v1", "")}${product.user_image}`
        : null;

    return (
        <Card title={<Title level={4}>{product?.persian_title}</Title>}>
            <Form onFinish={onFinish} form={form} layout="vertical">
                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item name="user_description">
                            <Input.TextArea
                                rows={5}
                                placeholder="توضیحات محصول"
                                style={{ height: 350, resize: 'none' }}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={16}>
                        <Form.Item name="user_image" initialValue={null}>
                            <ProductImageHandler
                                initialImageUrl={initialImageUrl}
                                onDeleteFromServer={onDeleteImage}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24} style={{ textAlign: 'end' }}>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                ذخیره تغییرات
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};

export default ProductInfoForm;