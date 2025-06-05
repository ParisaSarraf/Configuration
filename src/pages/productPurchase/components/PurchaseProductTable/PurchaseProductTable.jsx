import { Table } from "antd"
import PurchaseProductCol from "./PurchaseProductCol"
import { useUnConfirmProductPurchaseById } from "../../../../QueryServises/productPurchase"

const PurchaseProductTable = ({ currentProduct, setSelectedPurchaseId }) => {
    const { data: purchaseData, refetch } = useUnConfirmProductPurchaseById(currentProduct?.id)

    // console.log(purchaseData);

    const handleEdit = () => {
    }

    const handleDelete = () => {
    }

    const rowSelection = {
        type: 'radio',
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedPurchaseId(selectedRowKeys[0] || null);
        }
    };

    return (
        <Table
            columns={PurchaseProductCol({ handleEdit, handleDelete })}
            dataSource={purchaseData}
            rowSelection={rowSelection}
            rowKey="id"
        />
    )
}

export default PurchaseProductTable