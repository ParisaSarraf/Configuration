import {Select, Space ,Tag} from "antd";

const ListOfRequestsMadeCol = () => {
    return [
        {
        title: 'نام محصول',
        dataIndex: ['product_purchase_numbers',0, 'product', 'persian_title'],
        key: 'persian_title',
        },
        {
            title: 'کد محصول',
            key: 'code',
            dataIndex: ['product_purchase_numbers',0,'product', 'code'],
        },
        {
            title: 'نوع خرید',
            dataIndex: 'purchase_type',
            key: 'purchase_type',
            render: (record) => {
                return (<Tag color={record === 'assembly' ? 'blue' : 'gold'}>{record === 'assembly' ? 'مونتاژ' : 'ساخت'}</Tag>)
            }
        },
        {
            title: 'تعداد',
            dataIndex: ['product_purchase_numbers',0, 'confirmed_number'],
            key: 'confirmed_number',
            render: (text) => text || 'ندارد'
        }, {
            title: 'درصد مونتاژ',
            dataIndex: 'charge_percentage',
            key: 'charge_percentage',
            render: (text) => text || 'ندارد'
        }, {
            title: 'تعداد پشتیبانی',
            dataIndex: 'support_number',
            key: 'support_number',
            render: (text) => text || 'ندارد'
        }, {
            title: 'تعداد کل',
            dataIndex: 'total_number',
            key: 'total_number',
            render: (text) => text || 'ندارد'
        }, {
            title: 'تاریخ درخواست',
            dataIndex: 'total_number',
            key: 'total_number',
            render: (text) => text || 'ندارد'
        }, {
            title: 'تاریخ تایید',
            dataIndex: 'total_number',
            key: 'total_number',
            render: (text) => text || 'ندارد'
        },
        // {
        //     title: 'عملیات',
        //     key: 'actions',
        //     render: () => {
        //         return (<Space>
        //             <Select/>
        //         </Space>)
        //     }
        // },
    ]
}

export default ListOfRequestsMadeCol