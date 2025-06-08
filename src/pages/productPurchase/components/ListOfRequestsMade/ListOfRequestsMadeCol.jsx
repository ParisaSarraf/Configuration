const ListOfRequestsMadeCol = () => {
    return [
        {
            title: 'نام محصول',
            dataIndex: ['product_purchase_numbers', 'persian_title'],
            key: 'purchase_type'
        },
        {
            title: 'تعداد تایید شده',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (text) => text || 'ندارد'
        },
        {
            title: 'درصد مونتاژ',
            dataIndex: 'charge_percentage',
            key: 'charge_percentage',
            render: (text) => text || 'ندارد'
        },
        {
            title: 'تعداد پشتیبانی',
            dataIndex: 'support_number',
            key: 'support_number',
            render: (text) => text || 'ندارد'
        },
        {
            title: 'تعداد کل',
            dataIndex: 'total_number',
            key: 'total_number',
            render: (text) => text || 'ندارد'
        },
    ]
}

export default ListOfRequestsMadeCol