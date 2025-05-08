import React from 'react';
import { useProductContext } from '../../Services/Context/ProductContext';
import { Card, Descriptions, Tag, Typography, List, Row, Col } from 'antd';

const { Title } = Typography;

const Introduction = () => {
    const { currentProduct } = useProductContext();
    const product = currentProduct?.productData;

    if (!product) {
        return <div>محصولی یافت نشد</div>;
    }

    const renderValue = (value) => {
        return value !== null && value !== undefined ? value : '-';
    };

    return (
        <div style={{ padding: 24 }}>
            {/* <Title level={3} style={{ marginBottom: 24 }}>مشخصات محصول</Title> */}

            <Card title="اطلاعات پایه" style={{ marginBottom: 24  }}>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="عنوان فارسی">{product.persian_title}</Descriptions.Item>
                    <Descriptions.Item label="کد محصول">{product.code}</Descriptions.Item>
                    <Descriptions.Item label="نوع شخصیت">
                        <Tag color={product.personality_type === 'standard' ? 'green' : 'orange'}>
                            {product.personality_type === 'standard' ? 'استاندارد' : 'غیر استاندارد'}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="وضعیت">
                        {product.status === 'active' ? (
                            <Tag color="green">فعال</Tag>
                        ) : (
                            <Tag color="red">غیرفعال</Tag>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="کد انبار">{renderValue(product.store_code)}</Descriptions.Item>
                    <Descriptions.Item label="کد نهایی">{renderValue(product.final_code)}</Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="مشخصات فیزیکی" style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="وزن (گرم)">{renderValue(product.weight)}</Descriptions.Item>
                            <Descriptions.Item label="طول (سانتی‌متر)">{renderValue(product.length)}</Descriptions.Item>
                            <Descriptions.Item label="عرض (سانتی‌متر)">{renderValue(product.width)}</Descriptions.Item>
                        </Descriptions>
                    </Col>
                    <Col span={12}>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="ارتفاع (سانتی‌متر)">{renderValue(product.height)}</Descriptions.Item>
                            <Descriptions.Item label="قطر خارجی">{renderValue(product.external_diagonal)}</Descriptions.Item>
                            <Descriptions.Item label="قطر داخلی">{renderValue(product.internal_diagonal)}</Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Row>
            </Card>

            <Card title="اطلاعات مالی" style={{ marginBottom: 24 }}>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="قیمت">{renderValue(product.price)} تومان</Descriptions.Item>
                    <Descriptions.Item label="تعداد">{renderValue(product.quantity)}</Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="اطلاعات برند" style={{ marginBottom: 24 }}>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="برند ۱">{renderValue(product.brand1)}</Descriptions.Item>
                    <Descriptions.Item label="توضیحات برند ۱">{renderValue(product.brand1_desc)}</Descriptions.Item>
                    <Descriptions.Item label="برند ۲">{renderValue(product.brand2)}</Descriptions.Item>
                    <Descriptions.Item label="توضیحات برند ۲">{renderValue(product.brand2_desc)}</Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="اطلاعات فنی" style={{ marginBottom: 24 }}>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="جنس اصلی">
                        {product.genus ? product.genus.name : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="جنس جایگزین">
                        {product.alternative_genus ? product.alternative_genus.name : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="محفظه">
                        {product.casing ? product.casing.name : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="توضیحات">
                        {renderValue(product.description)}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {product.children && product.children.length > 0 && (
                <Card title="محصولات مرتبط">
                    <List
                        dataSource={product.children}
                        renderItem={(child) => (
                            <List.Item>
                                <Descriptions bordered column={2} style={{ width: '100%' }}>
                                    <Descriptions.Item label="عنوان">{child.persian_title}</Descriptions.Item>
                                    <Descriptions.Item label="کد محصول">{child.code}</Descriptions.Item>
                                    <Descriptions.Item label="نام تجاری ۱">{renderValue(child.brand1)}</Descriptions.Item>
                                    <Descriptions.Item label=" شرح نام تجاری ۱">{renderValue(child.brand1_desc)}</Descriptions.Item>
                                </Descriptions>
                            </List.Item>
                        )}
                    />
                </Card>
            )}
        </div>
    );
};

export default Introduction;