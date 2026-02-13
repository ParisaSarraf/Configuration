import { message, Modal, Table, Tag } from "antd";
import {
  useDeleteRequestOfWarehouse,
  useGetConfirmedWarehouseRequestById,
} from "@/QueryServises/RequestOfWarehouse/index.js";

import ListOfRequestOfWareHouseMadeCol from "@/pages/RequestOfWarehouse/components/ListOfRequestOfWareHouseMade/ListOfRequestOfWareHouseMadeCol.jsx";
import { georgianDateToJalaliDate } from "@utils/timeTool.jsx";
import useModal from "../../../../hooks/useModal";
import { useState } from "react";
import { useUpdateRequestOfWarehouse } from "../../../../QueryServises/RequestOfWarehouse";
import ExportPurchaseExcelModal from "../../../../components/exportPurchaseExcelModal";

const ListOfRequestOfWareHouseMade = ({ currentProduct, refetch }) => {
  const { isOpen, modalMode, modalData, modalType, setModal, closeModal } =
    useModal();
  const { mutateAsync: updateWarehouse, isLoading: isUpdatingWarehouse } =
    useUpdateRequestOfWarehouse();
  const [exportExcelData, setExportExcelData] = useState(null);

  const { data: requestOfWarehouse, refetch: refetchRequestOfWarehouse } =
    useGetConfirmedWarehouseRequestById(currentProduct?.id);
  const { mutateAsync: deleteProductPurchaseWarehouse } =
    useDeleteRequestOfWarehouse();

  const expandedRowRender = (record) => {
    const nestedColumns = [
      {
        title: "نام محصول",
        dataIndex: ["product", "persian_title"],
        key: "persian_title",
      },
      {
        title: "کد محصول",
        dataIndex: ["product", "code"],
        key: "code",
        render: (record) => {
          return <Tag color={"orange"}>{record}</Tag>;
        },
      },
      {
        title: "تعداد تایید شده",
        dataIndex: "confirmed_number",
        key: "confirmed_number",
      },
      {
        title: "تاریخ تایید",
        dataIndex: "total_number",
        key: "total_number",
        render: (text) => {
          return (
            <Tag color={"green"}>
              {georgianDateToJalaliDate(text) || "ندارد"}
            </Tag>
          );
        },
      },
    ];

    const nestedDataSource = record.warehouse_request_numbers.map((item) => ({
      key: item.id,
      product: item.product,
      confirmed_number: item.confirmed_number,
    }));

    return (
      <Table
        columns={nestedColumns}
        dataSource={nestedDataSource}
        rowKey="key"
        bordered
        size={"small"}
        pagination={{
          defaultPageSize: 5,
          pageSizeOptions: [10, 20, 45, 100],
          size: "small",
          showSizeChanger: true,
        }}
      />
    );
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "حذف درخواست خرید کالا از انبار",
      content: "آیا از حذف این درخواست خرید کالا از انبار مطمئن هستید؟",
      okText: "بله",
      cancelText: "خیر",
      okType: "danger",
      async onOk() {
        try {
          await deleteProductPurchaseWarehouse(record?.id);
          message.success("درخواست خرید کالا از انبار با موفقیت حذف شد");
          await refetch();
        } catch (error) {
          message.error("حذف درخواست خرید کالا از انبار با خطا مواجه شد");
          throw error;
        }
      },
    });
  };

  const handleHide = (record) => {
    Modal.confirm({
      title: "مخفی شدن درخواست خرید",
      content: "آیا از مخفی شدن این درخواست خرید مطمئن هستید؟",
      okText: "بله",
      cancelText: "خیر",
      okType: "danger",
      loading: isUpdatingWarehouse,
      async onOk() {
        try {
          await updateWarehouse({
            RequestOfWarehouseId: record?.id,
            hide: true,
          });
          message.success("درخواست خرید کالا از انبار با موفقیت مخفی شد");
          (await refetchRequestOfWarehouse()) && refetch();
        } catch (error) {
          message.error("مخفی شدن درخواست خرید کالا از انبار با خطا مواجه شد");
          throw error;
        }
      },
    });
  };

  const handleExportAfterDescription = (id) => {
    setExportExcelData(id);
  };

  const handleExcelExportForRow = async (record) => {
    setModal({
      mode: "exportExcelWareHouse",
      data: record?.id,
      type: "exportExcelModal",
    });
  };

  return (
    <div>
      <Table
        columns={ListOfRequestOfWareHouseMadeCol({
          handleDelete,
          handleHide,
          handleExcelExportForRow,
        })}
        dataSource={requestOfWarehouse}
        pagination={{
          defaultPageSize: 5,
          pageSizeOptions: [10, 20, 45, 100],
          size: "small",
          showSizeChanger: true,
        }}
        rowKey="id"
        size={"small"}
        bordered
        expandedRowRender={expandedRowRender}
      />

      <ExportPurchaseExcelModal
        isOpen={modalType === "exportExcelModal" && isOpen}
        modalData={modalData}
        modalMode={modalMode}
        modalType={modalType}
        closeModal={closeModal}
        onExportSuccess={handleExportAfterDescription}
        refetch={refetch}
      />
    </div>
  );
};

export default ListOfRequestOfWareHouseMade;
