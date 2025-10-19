import { Typography } from 'antd';

const { Text } = Typography;


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
            dataIndex: ['standard_code', 'name'],
            key: 'standard_code',
        },
        {
            title: 'تعداد',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'کد کالا',
            dataIndex: 'warehouse_code',
            key: 'warehouse_code',
        },
        {
            title: 'موجودی انبار',
            // dataIndex: 'warehouse_code',
            // key: 'warehouse_code',
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