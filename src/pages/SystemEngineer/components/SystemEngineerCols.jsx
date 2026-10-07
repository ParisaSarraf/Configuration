import {DeleteOutlined, EditOutlined} from "@ant-design/icons"
import {Button, Space} from "antd"
import { georgianDateTimeToJalaliDateTime } from "../../../utils/timeTool"

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
            title: 'تاریخ و ساعت ثبت',
            dataIndex: 'register_date_time',
            key: 'register_date_time',
            render: (text) => {
                return (
                    <span>{georgianDateTimeToJalaliDateTime(text) || "ندارد"}</span>
                )
            }   

        },
        {
            title: 'کاربر ثبت کننده',
            dataIndex: 'user',
            key: 'user'
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