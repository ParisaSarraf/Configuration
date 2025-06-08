import { message, Modal, Table } from "antd"
import PurchaseProductCol from "./PurchaseProductCol"
import { useDeleteProductPurchase, useUnConfirmProductPurchaseById } from "../../../../QueryServises/productPurchase"

const PurchaseProductTable = ({ currentProduct, setSelectedPurchaseId, setModal }) => {
    const { data: purchaseData, refetch } = useUnConfirmProductPurchaseById(currentProduct?.id)
    const { mutateAsync: deleteProductPurchase } = useDeleteProductPurchase();


    const handleEdit = (record) => {
        setModal({ mode: 'edit', data: record, type: 'add' })
    }

    const handleDelete = (id) => {
        Modal.confirm({
            title: "حذف درخواست خرید",
            content: "از حذف این درخواست خرید مطمئن هستید؟",
            okText: "بله ، مطمئنم",
            cancelText: "خیر ، منصرف شدم.",
            async onOk() {
                try {
                    await deleteProductPurchase(id)
                    message.success("درخواست خرید با موفقیت حذف شد");
                    await refetch()
                } catch (error) {
                    message.error(error?.detail);
                    console.error(error);
                }
            },
            onCancel() {
                message.warning("عملیات حذف لغو شد");
            }
        });
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
            // expandable={{
            //     expandedRowRender: (record) => (
            //         <div>
            //             <p>نوع خرید: {record.purchase_type || 'ندارد'}</p>
            //             <p>تعداد: {record.quantity || 'ندارد'}</p>
            //             <p>درصد مونتاژ: {record.charge_percentage || 'ندارد'}</p>
            //             <p>تعداد پشتیبانی: {record.support_number || 'ندارد'}</p>
            //             <p>تعداد کل: {record.total_number || 'ندارد'}</p>
            //         </div>
            //     ),
            // }}
        />
    )
}

export default PurchaseProductTable