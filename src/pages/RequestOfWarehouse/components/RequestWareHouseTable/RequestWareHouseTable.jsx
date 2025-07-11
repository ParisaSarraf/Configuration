import {message, Modal, Table} from "antd"
import RequestWareHouseCol from "@/pages/RequestOfWarehouse/components/RequestWareHouseTable/RequestWareHouseCol.jsx";
import {
    useDeleteRequestOfWarehouse,
    useGetUnConfirmedWareRequestByIdKey
} from "@/QueryServises/RequestOfWarehouse/index.js";

const RequestWareHouseTable = ({currentProduct, setSelectedWareHouseId, setModal}) => {
    const {data: requestWareHouseData, refetch} = useGetUnConfirmedWareRequestByIdKey(currentProduct?.id)
    const {mutateAsync: deleteRequestWareHouse} = useDeleteRequestOfWarehouse();


    const handleEdit = (record) => {
        setModal({mode: 'edit', data: record, type: 'add'})
    }

    const handleDelete = (id) => {
        Modal.confirm({
            title: "حذف درخواست خرید",
            content: "از حذف این درخواست خرید مطمئن هستید؟",
            okText: "بله ، مطمئنم",
            cancelText: "خیر ، منصرف شدم.",
            async onOk() {
                try {
                    await deleteRequestWareHouse(id)
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
            setSelectedWareHouseId(selectedRowKeys[0] || null);
        }
    };

    return (
        <Table
            columns={RequestWareHouseCol({handleEdit, handleDelete})}
            dataSource={requestWareHouseData}
            rowSelection={rowSelection}
            rowKey="id"
        />
    )
}

export default RequestWareHouseTable