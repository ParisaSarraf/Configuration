import { useProductContext } from '../../Services/Context/ProductContext';
import { Card, Typography, Row, Col, Space, Image, Skeleton, Table, Input } from 'antd';
import { BASEURL } from "@/Services/axiosInstance.js";
import ProductCols from './components/ProductCols';
import TextArea from 'antd/es/input/TextArea';

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
                    <Col span={12}>
                        <Space direction="vertical" className='w-full'>
                            <Input.TextArea
                                rows={5}
                                size='small'
                                placeholder='توضیحات محصول'
                                style={{
                                    height: 350,
                                    width: '100%',
                                    resize: 'none'
                                }}
                            />
                        </Space>
                    </Col>
                    <Col span={12}>
                        {product.image ? (
                            <Image
                                width="100%"
                                style={{
                                    maxHeight: 400,
                                    height: 350,
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
                                height: 350,
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