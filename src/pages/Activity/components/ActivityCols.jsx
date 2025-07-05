import {Button, Flex, Tooltip} from "antd";
import {DeleteOutlined, EditOutlined, FolderAddOutlined, UserAddOutlined} from "@ant-design/icons";

const ActivityCols = ({handleEdit, handleDelete, handleTrustee, handlePlan}) => {
    return (
        [{
            title: "کد فعالیت",
            dataIndex: 'meeting',
            key: 'meeting'
        }, {
            title: "شرح فعالیت",
            dataIndex: 'description',
            key: 'description'
        }, {
            title: "متولی",
            dataIndex: ['trustee', 'username'],
            key: 'trustee'
        }, {
            title: "تاریخ شروع",
            dataIndex: 'from_date',
            key: 'from_date'
        }, {
            title: "تاریخ پایان",
            dataIndex: 'to_date',
            key: 'to_date'
        }, {
            title: "تایید انجام",
            dataIndex: 'confirmed_date',
            key: 'confirmed_date'
        }, {
            title: "نفر روز",
            dataIndex: 'person_day',
            key: 'person_day'
        }, {
            title: "تاریخ تایید طرح و برنامه",
            dataIndex: 'confirmed_date',
            key: 'confirmed_date'
        }, {
            title: "درصد عملکرد",
            dataIndex: 'description',
            key: 'description'
        }, {
            title: "فایل ضمیمه توسط متولی",
            key: 'trustee_file',
            render: (record) => record.trustee_file ? (
                <a href={record.trustee_file} target="_blank" rel="noopener noreferrer">دانلود</a>
            ) : (
                'بدون فایل'
            ),
        }, {
            title: 'عملیات',
            key: 'actions',
            render: (_, record) => (
                <Flex gap={4}>
                    <Tooltip title="حذف">
                        <Button
                            onClick={() => handleDelete(record.id)}
                            title="حذف"
                            icon={<DeleteOutlined/>}
                            danger
                        />
                    </Tooltip>
                    <Tooltip title="ویرایش">
                        <Button
                            icon={<EditOutlined/>}
                            className="text-green-500 border-green-500"
                            onClick={() => handleEdit(record)}
                            title='ویرایش'
                        />
                    </Tooltip>
                    <Tooltip title=" انجام توسط متولی">
                        <Button
                            icon={<UserAddOutlined/>}
                            className="text-orange-600 border-orange-600"
                            onClick={() => handleTrustee(record)}
                            title='انجام توسط متولی'
                        />
                    </Tooltip>
                    <Tooltip title=" انجام توسط طرح و برنامه">
                        <Button
                            icon={<FolderAddOutlined/>}
                            className="text-pink-700 border-pink-700"
                            onClick={() => handlePlan(record)}
                            title='انجام توسط طرح و برنامه'
                        />
                    </Tooltip>
                </Flex>
            ),
        },]
    )
}
export default ActivityCols