import { message, Modal, Table } from "antd";
import RequestWareHouseCol from "@/pages/RequestOfWarehouse/components/RequestWareHouseTable/RequestWareHouseCol.jsx";
import {
  useDeleteRequestOfWarehouse,
  useGetUnConfirmedWareRequestById,
} from "@/QueryServises/RequestOfWarehouse/index.js";
import { useEffect } from "react";

const RequestWareHouseTable = ({
  currentProduct,
  setSelectedWareHouseId,
  setModal,
  requestWareHouseData,
  setSelectedWareHouseType,
}) => {
  const { refetch } = useGetUnConfirmedWareRequestById(currentProduct?.id);
  const { mutateAsync: deleteRequestWareHouse } = useDeleteRequestOfWarehouse();

  useEffect(() => {
    refetch();
  }, [currentProduct?.id, refetch]);

  const handleEdit = (record) => {
    setModal({ mode: "edit", data: record, type: "RequestOfWarehouse" });
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "حذف درخواست خرید",
      content: "از حذف این درخواست خرید مطمئن هستید؟",
      okText: "بله ، مطمئنم",
      cancelText: "خیر ، منصرف شدم.",
      async onOk() {
        try {
          await deleteRequestWareHouse(id);
          message.success("درخواست خرید با موفقیت حذف شد");
        } catch (error) {
          message.error(error?.detail);
          console.error(error);
        }
        await refetch();
      },
      onCancel() {
        message.warning("عملیات حذف لغو شد");
      },
    });
  };

  const rowSelection = {
    type: "radio",
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedWareHouseType(selectedRows);
      setSelectedWareHouseId(selectedRowKeys[0] || null);
    },
  };

  return (
    <Table
      columns={RequestWareHouseCol({ handleEdit, handleDelete })}
      dataSource={requestWareHouseData}
      rowSelection={rowSelection}
      rowKey="id"
      bordered
      size="small"
      pagination={{
        defaultPageSize: 5,
        pageSizeOptions: [10, 20, 45, 100],
        size: "small",
        showSizeChanger: true,
      }}
    />
  );
};

export default RequestWareHouseTable;
