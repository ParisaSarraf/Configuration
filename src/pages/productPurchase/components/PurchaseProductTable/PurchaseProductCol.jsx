import { DeleteOutlined, EditOutlined } from "@ant-design/icons"
import { Button, Space, Tooltip } from "antd"

const PurchaseProductCol = ({ handleEdit, handleDelete }) => {
    return [
        {
            title: 'نوع خرید',
            dataIndex: ['precinct', 'title'],
            key: 'precinct'
        },
        {
            title: 'تعداد',
            dataIndex: 'experiment_text',
            key: 'experiment_text',
            render: (text) => text || 'ندارد'
        },
        {
            title: 'درصد مونتاژ',
            dataIndex: 'user',
            key: 'user',
            render: (text) => text || 'ندارد'
        },
        {
            title: 'تعداد پشتیبانی',
            dataIndex: 'registration_date',
            key: 'registration_date',
            render: (text) => text || 'ندارد'
        },
        {
            title: 'تعداد کل',
            dataIndex: 'code',
            key: 'code',
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
