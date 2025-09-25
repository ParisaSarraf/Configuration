import { Button, Flex } from "antd";
import {EditOutlined , DeleteOutlined} from "@ant-design/icons";

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
                <Button size={'small'} onClick={() => handleEdit(record)} icon={<EditOutlined/>} className={'text-green-600 border border-green-600'}/>
                <Button size={'small'} danger onClick={() => handleDelete(record.id)} icon={<DeleteOutlined />} />
            </Flex>
        )
    }
];