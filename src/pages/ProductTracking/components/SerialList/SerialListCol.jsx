import { Button } from "antd";

export const SerialListCol = [
    {
        title: 'Product ID',
        dataIndex: 'product_id',
        key: 'product_id',
    },
    {
        title: 'Parent ID',
        dataIndex: 'parent_id',
        key: 'parent_id',
    },
    {
        title: 'Serial Number',
        dataIndex: 'serial',
        key: 'serial',
    },
    {
        title: 'Actions',
        render() {
            return (
                <div>
                    <Button>Edit</Button>
                    <Button>Delete</Button>
                </div>
            );
        }
    },
];

