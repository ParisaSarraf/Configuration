import { Button, Flex } from "antd";

export const LifeCycleCol = ({ handleDelete, handleEdit }) => [
    {
        title: 'نام',
        dataIndex: 'title',
        key: 'title',
    },
    {
        title: 'برچسب',
        dataIndex: 'tag',
        key: 'tag',
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