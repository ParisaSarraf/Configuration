import {Space, Tag, Typography} from 'antd';
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
        },

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
            title: 'کد استاندارد',
            dataIndex: 'standard_code',
            key: 'standard_code',
            render: (record) => {
                return (
                    <Space>{record}</Space>
                )
            }
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
            title: 'جمع خرید',
            dataIndex: 'sum_purchases',
            key: 'sum_purchases',
        },
        {
            title: 'جمع درخواست کالا از انبار',
            dataIndex: 'sum_ware_house',
            key: 'sum_ware_house',
        }
    ];
};

export default ProductCols;