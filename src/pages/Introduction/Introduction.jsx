import React from 'react';
import {useProductContext} from '../../Services/Context/ProductContext';
import {Card, Descriptions, Tag, Typography, List, Row, Col, Divider, Space, Image, Skeleton, Table} from 'antd';
import {CheckCircleOutlined, CloseCircleOutlined} from '@ant-design/icons';
import {BASEURL} from "@/Services/axiosInstance.js";

const {Title, Text} = Typography;

const Introduction = () => {
    const {currentProduct} = useProductContext();
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
            <Tag icon={<CheckCircleOutlined/>} color="green">
                فعال
            </Tag>
        ) : (
            <Tag icon={<CloseCircleOutlined/>} color="red">
                غیرفعال
            </Tag>
        );
    };

    return (
        <div style={{padding: 16}}>
            {/* Header Section */}
            <Card className="mb-6" bordered={false}>
                <Row gutter={16} align="middle">
                    <Col xs={24} md={24}>
                        {product.image ? (
                            <Image
                                width="100%"
                                style={{
                                    maxHeight: 200,
                                    height: 200,
                                    objectFit: 'contain',
                                    width: '100%',
                                    justifyContent: 'center',
                                    backgroundColor: '#E2E2E2'
                                }}
                                src={`${BASEURL.replace("/api/v1", "")}${product.image}`}
                                alt="تصویر محصول"
                            />
                        ) : (
                            <div style={{
                                height: 200,
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#E2E2E2'
                            }}>
                                <Skeleton.Image
                                    // active
                                    // style={{
                                    //     width: '100%',
                                    //     height: '100%'
                                    // }}
                                />
                            </div>
                        )}
                    </Col>
                    <Col xs={24} md={18}>
                        <Space direction="vertical" size="small" style={{width: '100%'}}>
                            <Title level={4}>{product.persian_title} ({product.code})</Title>
                            <Space size="small" style={{width: '100%'}}>
                                {renderStatusTag(product.status)}
                                <Tag color={product.personality_type === 'standard' ? 'blue' : 'orange'}>
                                    نوع هویت : {product.personality_type}
                                </Tag>
                            </Space> <Text style={{whiteSpace: 'pre-line'}}>توضیحات:{(product.description)}</Text>

                        </Space>
                    </Col>
                </Row>
            </Card>
            {product.children && product.children.length > 0 && (
                <Card
                    title="محصولات زیرمجموعه"
                    headStyle={{borderBottom: '1px solid #f0f0f0'}}
                >
                    <Table dataSource={product.children}
                        // columns={}
                    />
                    {/*<List*/}
                    {/*    dataSource={product.children}*/}
                    {/*    renderItem={(child) => (*/}
                    {/*        <List.Item className="mb-4">*/}
                    {/*            <Card size="small" style={{width: '100%'}}>*/}
                    {/*                <Descriptions column={4}>*/}
                    {/*                    <Descriptions.Item label="عنوان">{child.persian_title}</Descriptions.Item>*/}
                    {/*                    <Descriptions.Item label="کد محصول">{child.code}</Descriptions.Item>*/}
                    {/*                    <Descriptions.Item label="برند">{renderValue(child.brand1)}</Descriptions.Item>*/}
                    {/*                    <Descriptions.Item label="وضعیت">*/}
                    {/*                        {renderStatusTag(child.status)}*/}
                    {/*                    </Descriptions.Item>*/}
                    {/*                </Descriptions>*/}
                    {/*            </Card>*/}
                    {/*        </List.Item>*/}
                    {/*    )}*/}
                    {/*/>*/}
                </Card>
            )}
        </div>
    );
};

export default Introduction;