import { message, Modal, Table, Tag } from "antd";
import {
  useConfirmProductPurchaseById,
  useDeleteProductPurchase,
} from "@/QueryServises/productPurchase/index.js";
import ListOfRequestsMadeCol from "./ListOfRequestsMadeCol";
import { georgianDateToJalaliDate } from "@utils/timeTool.jsx";
import { useExportExcelProductPurchase } from "../../../../QueryServises/ExcelExporterQuery";
import { useEffect, useState } from "react";
import { handleDownload } from "@utils/HandleDownload.js";
import useModal from "../../../../hooks/useModal";
import { useUpdateProductPurchase } from "../../../../QueryServises/productPurchase";
import ExportPurchaseExcelModal from "../../../../components/exportPurchaseExcelModal";

const ListOfRequestsMade = ({ currentProduct, refetch }) => {
  const { isOpen, modalMode, modalData, modalType, setModal, closeModal } =
    useModal();
  const { data: purchaseData, refetch: purchaseDataRefetch } =
    useConfirmProductPurchaseById(currentProduct?.id);
  const { mutateAsync: deleteProductPurchase } = useDeleteProductPurchase(
    currentProduct?.id
  );
  const { mutateAsync: updateProductPurchase, isLoading: isUpdating } =
    useUpdateProductPurchase();
  const [exportExcelData, setExportExcelData] = useState(null);
  const { data: exportExcel, refetch: refetchExport } =
    useExportExcelProductPurchase(exportExcelData, {
      enabled: false,
    });

  useEffect(() => {
    if (exportExcelData) {
      refetchExport();
    }
  }, [exportExcelData, refetchExport]);

  useEffect(() => {
    if (exportExcel && exportExcelData) {
      handleDownload(exportExcel, `purchase_list_${exportExcelData}.csv`);
      setExportExcelData(null);
    }
  }, [exportExcel, exportExcelData]);

  const handleExportAfterDescription = (id) => {
    setExportExcelData(id);
  };

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
        dataIndex: "date",
        key: "date",
        render: (text) => {
          return <Tag color={"green"}>{georgianDateToJalaliDate(text)}</Tag>;
        },
      },
    ];

    const nestedDataSource = record.product_purchase_numbers.map((item) => ({
      key: item.id,
      product: item.product,
      confirmed_number: item.confirmed_number,
      date: item.date,
    }));

    return (
      <Table
        columns={nestedColumns}
        dataSource={nestedDataSource}
        rowKey="key"
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
      title: "حذف درخواست خرید",
      content: "آیا از حذف این درخواست خرید مطمئن هستید؟",
      okText: "بله",
      cancelText: "خیر",
      okType: "danger",
      async onOk() {
        try {
          await deleteProductPurchase(record?.id);
          message.success("درخواست خرید با موفقیت حذف شد");
          await (refetch() && purchaseDataRefetch());
        } catch (error) {
          message.error("حذف درخواست خرید با خطا مواجه شد");
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
      loading: isUpdating,
      async onOk() {
        try {
          await updateProductPurchase({
            productPurchaseId: record?.id,
            hide: true,
          });
          message.success("درخواست خرید با موفقیت مخفی شد");
          await (refetch() && purchaseDataRefetch());
        } catch (error) {
          message.error("مخفی شدن درخواست خرید با خطا مواجه شد");
          throw error;
        }
      },
    });
  };

  const handleExcelExportForRow = async (record) => {
    setModal({
      mode: "exportExcel",
      data: record?.id,
      type: "exportExcelModal",
    });
  };

  return (
    <div className={"w-full flex flex-col"}>
      <Table
        columns={ListOfRequestsMadeCol({
          handleDelete,
          handleHide,
          handleExcelExportForRow,
        })}
        dataSource={purchaseData || []}
        pagination={{
          defaultPageSize: 5,
          pageSizeOptions: [10, 20, 45, 100],
          size: "small",
          showSizeChanger: true,
        }}
        rowKey="id"
        bordered
        size={"small"}
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

export default ListOfRequestsMade;
