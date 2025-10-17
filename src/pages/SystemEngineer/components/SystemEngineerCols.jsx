import {DeleteOutlined, EditOutlined} from "@ant-design/icons"
import {Button, Space} from "antd"

const SystemEngineerCols = ({handleDelete, handleEdit}) => {
    return [
        {
            title: 'نام حوزه', dataIndex: ['precinct', 'title'], key: 'precinct'
        },
        {
            title: 'شرح فعالیت',
            dataIndex: 'title',
            key: 'title'
        },
        {
            title: 'توضیحات',
            dataIndex: 'description',
            key: 'description'
        },
        {
            title: 'عملیات',
            render: (_, record) => {
                return (
                    <Space className="w-full flex-row gap-2">
                        <Button size={"small"} title="ویرایش" icon={<EditOutlined/>}
                                className="border border-green-500 text-green-500"
                                onClick={() => handleEdit(record)}/>
                        <Button size={'small'} title="حذف " icon={<DeleteOutlined/>} danger
                                onClick={() => handleDelete(record?.id)}/>
                    </Space>
                )
            }
        }
    ]

}

export default SystemEngineerCols