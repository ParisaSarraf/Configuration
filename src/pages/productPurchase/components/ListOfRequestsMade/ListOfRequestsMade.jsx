import { message, Modal, Table, Tag } from "antd";
import {
  useConfirmProductPurchaseById,
  useDeleteProductPurchase,
  useCreatePurchaseZipReport, // 👈 new
} from "@/QueryServises/productPurchase/index.js";
import { usePurchaseZipReportStatus } from "@/QueryServises/productPurchase/index.js"; // 👈 new
import ListOfRequestsMadeCol from "./ListOfRequestsMadeCol";
import { georgianDateToJalaliDate } from "@utils/timeTool.jsx";
import { useExportExcelProductPurchase } from "../../../../QueryServises/ExcelExporterQuery";
import { useEffect, useState } from "react";
import { handleDownload } from "@utils/HandleDownload.js";
import useModal from "../../../../hooks/useModal";
import {
  useCreatePdfById,
  useUpdateProductPurchase,
} from "../../../../QueryServises/productPurchase";
import ExportPurchaseExcelModal from "../../../../components/exportPurchaseExcelModal";
import { Progress, Typography } from "antd";
import { BASEURL } from "../../../../Services/axiosInstance.js"; // 👈 adjust path if needed

// ── Zip Progress Modal ─────────────────────────────────────────────────────
const PurchaseZipProgressModal = ({ uuid, fileName, onDone, onClose }) => {
  const { data, isError } = usePurchaseZipReportStatus(uuid, { enabled: true });

  const status = data?.status;
  const percent = data?.progress_percent ?? 0;
  const passed = data?.passed ?? 0;
  const total = data?.total ?? 0;

  useEffect(() => {
    if (status === "SUCCESS" && data?.file) {
      const baseOrigin = BASEURL.replace("/api/v1", "");
      const downloadUrl = `${baseOrigin}${data.file}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `Purchase-${fileName || "list"}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      message.success("فایل با موفقیت دانلود شد");
      onDone();
    }
    if (status === "FAILURE" || isError) {
      message.error("خطا در ساخت فایل ZIP");
      onClose();
    }
  }, [status, isError]);

  const progressStatus =
    status === "SUCCESS" ? "success" : isError ? "exception" : "active";

  return (
    <Modal
      open
      title="در حال آماده‌سازی فایل ZIP"
      footer={null}
      closable={status === "SUCCESS" || status === "FAILURE" || isError}
      onCancel={onClose}
      centered
    >
      <div className="py-4 flex flex-col gap-3">
        <Progress
          percent={percent}
          status={progressStatus}
          strokeColor={{ from: "#108ee9", to: "#87d068" }}
        />
        <Typography.Text type="secondary" className="text-center block">
          {status === "SUCCESS"
            ? "آماده — در حال دانلود..."
            : `پردازش شده: ${passed} از ${total} فایل`}
        </Typography.Text>
        {status !== "SUCCESS" && (
          <Typography.Text
            type="secondary"
            className="text-center block text-xs"
          >
            وضعیت هر ۲ ثانیه به‌روز می‌شود
          </Typography.Text>
        )}
      </div>
    </Modal>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const ListOfRequestsMade = ({ currentProduct, refetch }) => {
  const { isOpen, modalMode, modalData, modalType, setModal, closeModal } =
    useModal();
  const { data: purchaseData, refetch: purchaseDataRefetch } =
    useConfirmProductPurchaseById(currentProduct?.id);
  const { mutateAsync: deleteProductPurchase } = useDeleteProductPurchase(
    currentProduct?.id,
  );
  const { mutateAsync: updateProductPurchase, isLoading: isUpdating } =
    useUpdateProductPurchase();
  const [exportExcelData, setExportExcelData] = useState(null);
  const { data: exportExcel, refetch: refetchExport } =
    useExportExcelProductPurchase(exportExcelData, { enabled: false });

  // 👇 zip state
  const { mutate: createZip, isLoading: isRequestingZip } =
    useCreatePurchaseZipReport();
  const [zipTask, setZipTask] = useState(null); // { uuid, fileName }

  useEffect(() => {
    if (exportExcelData) refetchExport();
  }, [exportExcelData, refetchExport]);

  useEffect(() => {
    if (exportExcel && exportExcelData) {
      handleDownload(exportExcel, `purchase_list_${exportExcelData}.csv`);
      setExportExcelData(null);
    }
  }, [exportExcel, exportExcelData]);

  const { mutateAsync: createPdf } = useCreatePdfById();

  const handleExportAfterDescription = (id) => setExportExcelData(id);

  // 👇 new handler
  const handleDownloadZip = (record) => {
    createZip(record?.id, {
      onSuccess: (data) => {
        if (data?.uuid) {
          setZipTask({
            uuid: data.uuid,
            fileName: record?.id,
          });
        } else {
          message.error("خطا: شناسه وظیفه دریافت نشد");
        }
      },
      onError: () => {
        message.error("خطا در شروع ساخت فایل ZIP");
      },
    });
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
        render: (record) => <Tag color={"orange"}>{record}</Tag>,
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
        render: (text) => (
          <Tag color={"green"}>{georgianDateToJalaliDate(text)}</Tag>
        ),
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

  const handleExportPdfForRow = async (record) => {
    Modal.confirm({
      title: "تایید خروجی PDF",
      content: (
        <div>
          <p>
            آیا از خروجی PDF برای محصول <strong>{record.name}</strong> اطمینان
            دارید؟
          </p>
        </div>
      ),
      okText: "بله، خروجی بگیر",
      cancelText: "انصراف",
      onOk: async () => {
        try {
          await createPdf(record.id);
          message.success("خروجی PDF با موفقیت ایجاد شد");
        } catch (error) {
          message.error("خطا در ایجاد خروجی PDF");
        }
      },
    });
  };


  return (
    <div className={"w-full flex flex-col"}>
      <Table
        columns={ListOfRequestsMadeCol({
          handleDelete,
          handleHide,
          handleExcelExportForRow,
          handleExportPdfForRow,
          handleDownloadZip, // 👈 pass to columns
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
        loading={isRequestingZip} // 👈 spinner while requesting
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

      {/* 👇 Progress modal — only mounts while a zip task is active */}
      {zipTask && (
        <PurchaseZipProgressModal
          uuid={zipTask.uuid}
          fileName={zipTask.fileName}
          onDone={() => setZipTask(null)}
          onClose={() => setZipTask(null)}
        />
      )}
    </div>
  );
};

export default ListOfRequestsMade;
