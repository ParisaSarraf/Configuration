import {Table, Tag} from "antd";
import {useConfirmProductPurchaseById} from "@/QueryServises/productPurchase/index.js";
import ListOfRequestsMadeCol from "./ListOfRequestsMadeCol";

const ListOfRequestsMade = ({currentProduct, refetch}) => {
    const {data: purchaseData} = useConfirmProductPurchaseById(currentProduct?.id);


    const expandedRowRender = (record) => {
        const nestedColumns = [
            {
                title: 'نام محصول',
                dataIndex: ['product', 'persian_title'],
                key: 'persian_title',
            },
            {
                title: 'کد محصول',
                dataIndex: ['product', 'code'],
                key: 'code',
                render: (record) => {
                    return (<Tag color={'orange'}>{record}</Tag>)
                }
            },
            {
                title: 'تعداد تایید شده',
                dataIndex: 'confirmed_number',
                key: 'confirmed_number',
            }
        ];

        const nestedDataSource = record.product_purchase_numbers.map(item => ({
            key: item.id,
            product: item.product,
            confirmed_number: item.confirmed_number
        }));

        return (
            <Table
                columns={nestedColumns}
                dataSource={nestedDataSource}
                pagination={false}
                rowKey="key"
                size={'small'}
            />
        );
    };

    return (
        <Table
            columns={ListOfRequestsMadeCol()}
            dataSource={purchaseData || []}
            pagination={false}
            rowKey='id'
            size={'small'}
            expandedRowRender={expandedRowRender}
        />
    );
};

export default ListOfRequestsMade;
