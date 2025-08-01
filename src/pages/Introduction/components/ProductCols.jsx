import {Tag, Typography} from 'antd';
import {CheckCircleOutlined, CloseCircleOutlined} from '@ant-design/icons';

const {Text} = Typography;

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

const formatPrice = (price) => {
    if (!price) return '-';
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
};

const ProductCols = () => {
    return [
        {
            title: 'ردیف',
            key: 'index',
            render: (_, __, index) => index + 1,
        },            // render: (text) => <Text strong>{text}</Text>,

        {
            title: 'عنوان محصول',
            dataIndex: 'persian_title',
            key: 'persian_title',
            render: (text) => <Text>{text}</Text>,
        },
        {
            title: 'کد',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'کد تجاری',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'تعداد',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'کد انبار',
            dataIndex: 'store_code',
            key: 'store_code',
        },
        {
            title: 'موجودی',
            dataIndex: 'Inventory',
            key: 'Inventory',
        }
    ];
};

export default ProductCols;