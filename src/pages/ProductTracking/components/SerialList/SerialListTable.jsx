import { message, Modal, Table } from 'antd'
import { SerialListCol } from './SerialListCol'
import { useDeleteProductSerial, useProductSerialById } from '../../../../QueryServises/productSerialQuery'
import { useState } from 'react'

const SerialListTable = ({ isOpen, modalMode, modalData, closeModal, setModal, currentProduct,setSelectedRowId, selectedRowId }) => {
    const { data: productSerial, refetch } = useProductSerialById(currentProduct?.id)
    const { mutateAsync: deleteProductSerial } = useDeleteProductSerial()



    const handleEditProductSerial = (record) => {
        setModal({ mode: 'edit', data: record, type: 'ProductSerial' })
    }

    const handleDeleteProductSerial = async (id) => {
        Modal.confirm({
            title: 'حذف سریال',
            content: 'آیا از حذف این سریال مطمئن هستید؟',
            okText: 'بله',
            cancelText: 'خیر',
            onOk: async () => {
                try {
                    await deleteProductSerial(id)
                    message.success("سریال با موفقیت حذف شد")
                    refetch()
                } catch (error) {
                    console.error(error);
                }
            },
        })
    }

    const columns = SerialListCol(handleEditProductSerial, handleDeleteProductSerial);
    return (
        <Table
            columns={columns}
            dataSource={productSerial?.serials}
            rowKey="id" 
            rowSelection={{
                type: 'radio',
                selectedRowKeys: selectedRowId ? [selectedRowId] : [],
                onChange: (selectedRowKeys, selectedRows) => {
                    // console.log(selectedRowKeys, selectedRows);
                    setSelectedRowId(selectedRowKeys[0] || null);
                }
            }}
        />
    )
}

export default SerialListTable
