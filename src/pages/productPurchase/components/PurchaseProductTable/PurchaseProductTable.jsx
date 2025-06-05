import { Table } from "antd"
import PurchaseProductCol from "./PurchaseProductCol"
import { useProductPurchaseById } from "../../../../QueryServises/productPurchase"

const PurchaseProductTable = ({ currentProduct }) => {

    const { data: purchaseData, refetch } = useProductPurchaseById(currentProduct?.id)

    console.log(purchaseData);



    // console.log(purchaseData);
    const handleEdit = () => {

    }

    const handleDelete = () => {

    }

    return (
        <Table columns={PurchaseProductCol({ handleEdit, handleDelete })} dataSource={purchaseData} />
    )
}

export default PurchaseProductTable
