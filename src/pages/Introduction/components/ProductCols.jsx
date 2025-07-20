import { Tag, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

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

const formatPrice = (price) => {
    if (!price) return '-';
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
};

const ProductCols = () => {
    return [
        {
            title: 'عنوان محصول',
            dataIndex: 'persian_title',
            key: 'persian_title',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'کد محصول',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'برند',
            dataIndex: 'brand1',
            key: 'brand1',
            render: (text) => text || '-',
        },
        {
            title: 'وضعیت',
            dataIndex: 'status',
            key: 'status',
            render: renderStatusTag,
        },
        {
            title: 'قیمت',
            dataIndex: 'price',
            key: 'price',
            render: formatPrice,
        },
        {
            title: 'نوع هویت',
            dataIndex: 'personality_type',
            key: 'personality_type',
            render: (text) => (
                <Tag color={text === 'standard' ? 'blue' : 'orange'}>
                    {text === 'standard' ? 'استاندارد' : 'غیر استاندارد'}
                </Tag>
            ),
        },
    ];
};

export default ProductCols;