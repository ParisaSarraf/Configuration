import { Button, Flex } from "antd";

export const GenusStandardCol = ({ handleDelete, handleEdit }) => [
    {
        title: 'نام',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'عملیات',
        key: 'actions',
        render: (_, record) => (
            <Flex gap="small">
                <Button type="link" onClick={() => handleEdit(record)}>ویرایش</Button>
                <Button type="link" danger onClick={() => handleDelete(record.id)}>حذف</Button>
            </Flex>
        )
    }
];