import React from 'react';
import { useProductContext } from '../../Services/Context/ProductContext';
import { Card, Descriptions, Tag, Typography, List, Row, Col, Divider, Space, Image } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import {BASEURL} from "@/Services/axiosInstance.js";

const { Title, Text } = Typography;

const Introduction = () => {
    const { currentProduct } = useProductContext();
    const product = currentProduct?.productData;

    if (!product) {
        return <div className="text-center py-8">محصولی یافت نشد</div>;
    }

    const renderValue = (value) => {
        return value !== null && value !== undefined ? value.toString() : '-';
    };

    const formatPrice = (price) => {
        if (!price) return '-';
        return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
    };

    const renderStatusTag = (status) => {
        return status === 'active' ? (
            <Tag icon={<CheckCircleOutlined />} color="green">
                فعال
            </Tag>
        ) : (
            <Tag icon={<CloseCircleOutlined />} color="red">
                غیرفعال
            </Tag>
        );
    };

    return (
        <div style={{ padding: 16 }}>
            {/* Header Section */}
            <Card className="mb-6" bordered={false}>
                <Row gutter={16} align="middle">
                    <Col xs={24} md={6}>
                        {product.image && (
                            <Image
                                width="100%"
                                style={{ maxHeight: 200, objectFit: 'cover' }}

                                src={`${BASEURL.replace("/api/v1", "")}${product.image}`}
                                alt="تصویر محصول"
                            />
                        )}
                    </Col>
                    <Col xs={24} md={18}>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Title level={3}>{product.persian_title}</Title>
                            <Text type="secondary">کد: {product.code}</Text>
                            <Space size="middle">
                                <Tag color={product.personality_type === 'standard' ? 'blue' : 'orange'}>
                                    {product.personality_type === 'standard' ? 'استاندارد' : 'سفارشی'}
                                </Tag>
                                {renderStatusTag(product.status)}
                            </Space>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Card
                title="اطلاعات پایه"
                className="mb-6"
                headStyle={{ borderBottom: '1px solid #f0f0f0' }}
            >
                <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                    <Descriptions.Item label="کد انبار">{renderValue(product.store_code)}</Descriptions.Item>
                    <Descriptions.Item label="کد نهایی">{renderValue(product.final_code)}</Descriptions.Item>
                    <Descriptions.Item label="کد کارفرما">{renderValue(product.employer_code)}</Descriptions.Item>
                    <Descriptions.Item label="کد استاندارد">{renderValue(product.standard_code)}</Descriptions.Item>
                </Descriptions>
            </Card>

            <Card
                title="مشخصات فیزیکی"
                className="mb-6"
                headStyle={{ borderBottom: '1px solid #f0f0f0' }}
            >
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="وزن (گرم)">{renderValue(product.weight)}</Descriptions.Item>
                            <Descriptions.Item label="طول (سانتی‌متر)">{renderValue(product.length)}</Descriptions.Item>
                            <Descriptions.Item label="عرض (سانتی‌متر)">{renderValue(product.width)}</Descriptions.Item>
                        </Descriptions>
                    </Col>
                    <Col xs={24} md={12}>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="ارتفاع (سانتی‌متر)">{renderValue(product.height)}</Descriptions.Item>
                            <Descriptions.Item label="قطر خارجی">{renderValue(product.external_diagonal)}</Descriptions.Item>
                            <Descriptions.Item label="قطر داخلی">{renderValue(product.internal_diagonal)}</Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Row>
            </Card>

            <Card
                title="اطلاعات مالی"
                className="mb-6"
                headStyle={{ borderBottom: '1px solid #f0f0f0' }}
            >
                <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                    <Descriptions.Item label="قیمت">{formatPrice(product.price)}</Descriptions.Item>
                    <Descriptions.Item label="موجودی">{renderValue(product.quantity)} عدد</Descriptions.Item>
                </Descriptions>
            </Card>

            <Card
                title="اطلاعات برند"
                className="mb-6"
                headStyle={{ borderBottom: '1px solid #f0f0f0' }}
            >
                <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                    <Descriptions.Item label="برند اصلی" span={2}>
                        <div>
                            <Text strong>{renderValue(product.brand1)}</Text>
                            <Divider type="vertical" />
                            <Text type="secondary">{renderValue(product.brand1_desc)}</Text>
                        </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="برند ثانویه" span={2}>
                        <div>
                            <Text strong>{renderValue(product.brand2)}</Text>
                            <Divider type="vertical" />
                            <Text type="secondary">{renderValue(product.brand2_desc)}</Text>
                        </div>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card
                title="اطلاعات فنی"
                className="mb-6"
                headStyle={{ borderBottom: '1px solid #f0f0f0' }}
            >
                <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                    <Descriptions.Item label="جنس اصلی">
                        {product.genus ? product.genus.name : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="جنس جایگزین">
                        {product.alternative_genus ? product.alternative_genus.name : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="محفظه">
                        {product.casing ? product.casing.name : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="توضیحات" span={2}>
                        <Text style={{ whiteSpace: 'pre-line' }}>{renderValue(product.description)}</Text>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Related Products */}
            {product.children && product.children.length > 0 && (
                <Card
                    title="محصولات مرتبط"
                    headStyle={{ borderBottom: '1px solid #f0f0f0' }}
                >
                    <List
                        dataSource={product.children}
                        renderItem={(child) => (
                            <List.Item className="mb-4">
                                <Card size="small" style={{ width: '100%' }}>
                                    <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                                        <Descriptions.Item label="عنوان">{child.persian_title}</Descriptions.Item>
                                        <Descriptions.Item label="کد محصول">{child.code}</Descriptions.Item>
                                        <Descriptions.Item label="برند">{renderValue(child.brand1)}</Descriptions.Item>
                                        <Descriptions.Item label="وضعیت">
                                            {renderStatusTag(child.status)}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </List.Item>
                        )}
                    />
                </Card>
            )}
        </div>
    );
};

export default Introduction;