import { useProductContext } from '../../Services/Context/ProductContext';
import { Card, Typography, Row, Col, Space, Image, Skeleton, Table } from 'antd';
import { BASEURL } from "@/Services/axiosInstance.js";
import ProductCols from './ProductCols/ProductCols';

const { Title, Text } = Typography;

const RecursiveTable = ({ dataSource, columns }) => {
    return (
        <Table
            columns={columns}
            dataSource={dataSource}
            rowKey="id"
            expandable={{
                expandedRowRender: (record) => (
                    record.children && record.children.length > 0 ? (
                        <RecursiveTable
                            dataSource={record.children}
                            columns={columns}
                        />
                    ) : null
                ),
                rowExpandable: (record) => record.children && record.children.length > 0,
            }}
            pagination={false}
        />
    );
};

const Introduction = () => {
    const { currentProduct } = useProductContext();
    const product = currentProduct?.productData;

    if (!product) {
        return <div className="text-center py-8">محصولی یافت نشد</div>;
    }

    return (
        <div style={{ padding: 16 }}>
            <Card className="mb-1">
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
                                <Skeleton.Image />
                            </div>
                        )}
                    </Col>
                    <Col xs={24} md={18}>
                        <Space direction="vertical" className='mt-4'>
                            <Title level={4}>{product.persian_title} ({product.code})</Title>
                            <Text style={{ whiteSpace: 'pre-line' }}>توضیحات:{(product.description)}</Text>
                        </Space>
                    </Col>
                </Row>
            </Card>
            {product.children && product.children.length > 0 && (
                <Card title="محصولات زیرمجموعه" >
                    <RecursiveTable
                        dataSource={product.children}
                        columns={ProductCols()}
                    />
                </Card>
            )}
        </div>
    );
};

export default Introduction;