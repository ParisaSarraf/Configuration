import { DeleteOutlined, EditOutlined } from "@ant-design/icons"
import { Button, Space, Tooltip } from "antd"

const PurchaseProductCol = ({ handleEdit, handleDelete }) => {
    return [
        {
            title: 'نوع خرید',
            dataIndex: 'purchase_type',
            key: 'purchase_type'
        },
        {
            title: 'تعداد',
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
        {
            title: 'عملیات',
            render(_, record) {
                return (
                    <Space>
                        <Tooltip title="ویرایش">
                            <Button title="ویرایش" icon={<EditOutlined />} className="text-green-500 , border-green-500" onClick={() => handleEdit(record)} />
                        </Tooltip>
                        <Tooltip title="حذف">
                            <Button title="حذف" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record?.id)} />
                        </Tooltip>
                    </Space>
                )
            }
        }
    ]
}

export default PurchaseProductCol
