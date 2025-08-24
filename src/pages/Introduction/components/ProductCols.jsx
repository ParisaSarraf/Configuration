import {Space, Typography} from 'antd';

const {Text} = Typography;


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