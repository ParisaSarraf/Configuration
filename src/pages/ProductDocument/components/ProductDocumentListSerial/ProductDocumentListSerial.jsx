import { useCallback, useMemo } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Tooltip,
} from "antd";
import { useProductSerialById } from "@/QueryServises/productSerialQuery/index.js";
import { useProductDocumentEditionLogsBySerialById } from "@/QueryServises/productDocumentQuery/index.js";
import { ProductDocumentListSerialCol } from "./components/ProductDocumentListSerialCol";
import {
  useDeleteProductEditionlog,
  usePatchDocumentEditionLog,
} from "@/QueryServises/productDocumentEditionLogQuery/index.js";
import { DeleteOutlined, EyeFilled, CheckCircleOutlined } from "@ant-design/icons";
import { BASEURL } from "@/Services/axiosInstance.js";
import { TableAntd } from "../../../../components/TableAntd/TableAntd";
import useDocumentFileAccess from "@/hooks/useDocumentFileAccess";

const showAccessError = () =>
  message.error("شما اجازه مشاهده این فایل را ندارید");

const DocumentsTable = ({ documents, onDelete, onView, onConfirm, canViewEdition }) => {
  const documentData = useMemo(() => {
    const flatData = [];

    documents?.forEach((doc) => {
      const { editions, ...docDetails } = doc;

      const totalRows =
        editions?.reduce((sum, ed) => sum + (ed.logs?.length || 1), 0) || 1;

      if (!editions || editions.length === 0) {
        flatData.push({
          ...docDetails,
          key: `doc-${doc.id}`,
          editionData: null,
          logData: null,
          docRowSpan: 1,
          editionRowSpan: 1,
        });
        return;
      }

      let isFirstRowOfDoc = true;

      editions.forEach((edition) => {
        const { logs, ...editionDetails } = edition;
        const logCount = logs?.length || 0;

        if (logCount === 0) {
          flatData.push({
            ...docDetails,
            editionData: editionDetails,
            logData: null,
            key: `edition-${edition.id}`,
            docRowSpan: isFirstRowOfDoc ? totalRows : 0,
            editionRowSpan: 1,
          });
          isFirstRowOfDoc = false;
        } else {
          logs.forEach((log, index) => {
            flatData.push({
              ...docDetails,
              editionData: editionDetails,
              logData: log,
              key: `log-${log.id}`,
              docRowSpan: isFirstRowOfDoc ? totalRows : 0,
              editionRowSpan: index === 0 ? logCount : 0,
            });
            isFirstRowOfDoc = false;
          });
        }
      });
    });

    return flatData;
  }, [documents]);

  const documentColumns = useMemo(
    () => [
      {
        title: "کد سند",
        key: "edition_full_code",
        onCell: (record) => ({ rowSpan: record.editionRowSpan }),
        render: (_, record) =>
          record.editionData?.full_code ? record.editionData?.full_code : "--",
      },
      {
        title: "فایل",
        dataIndex: ["logData", "file"],
        key: "log_file",
        render: (fileUrl, record) =>
          fileUrl && !canViewEdition(record.editionData?.id, record.editionData?.state) ? "شما اجازه مشاهده این فایل را ندارید" : fileUrl ? (
            <a
              href={`${BASEURL.replace("/api/v1", "")}${fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => {
                if (!canViewEdition(record.editionData?.id, record.editionData?.state)) {
                  event.preventDefault();
                  showAccessError();
                }
              }}
            >
              مشاهده
            </a>
          ) : (
            "ندارد"
          ),
      },
      {
        title: "عملیات",
        key: "actions",
        fixed: "right",
        width: 120,
        render: (_, record) =>
          record.logData ? (
            <Space>
              <Tooltip title="حذف ">
                <Button
                  size="small"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => onDelete(record.logData)}
                />
              </Tooltip>
              <Tooltip title="نمایش جزئیات ">
                <Button
                  size="small"
                  icon={<EyeFilled />}
                  className="text-sky-500 border-sky-500"
                  onClick={() => onView(record)}
                />
              </Tooltip>
              <Tooltip title="تایید اسناد">
                <Button
                  size="small"
                  icon={<CheckCircleOutlined />}
                  className="text-green-500 border-green-500"
                  onClick={() => onConfirm(record)}
                />
              </Tooltip>
            </Space>
          ) : null,
      },
    ],
    [onDelete, onView, onConfirm, canViewEdition],
  );

  return (
    <TableAntd
      rowKey="key"
      columns={documentColumns}
      dataSource={documentData}
      pagination={false}
      className="rtl-table--fit"
      scroll={{}}
      tableLayout="fixed"
    />
  );
};

const ProductDocumentListSerial = ({
  currentProduct,
  serialId,
  setSerialId,
  setModal,
  setSerialLabel,
}) => {
  const fileAccess = useDocumentFileAccess(currentProduct?.id);
  const { data: ProductSerialList, isFetching: isFetchingSerials,
    isError: isSerialsError, refetch: refetchSerials } = useProductSerialById(currentProduct?.id, {
      enabled: currentProduct?.id != null, placeholderData: undefined,
    });
  const { mutateAsync: deleteProductEditionlog } = useDeleteProductEditionlog();
  const { mutateAsync: updateDocumentState } = usePatchDocumentEditionLog();
  const { data: ProductDocumentData, refetch: refetchProductDocumentData,
    isFetching: isFetchingDocuments, isError: isDocumentsError } =
    useProductDocumentEditionLogsBySerialById(serialId, {
      enabled: serialId != null, placeholderData: undefined,
    });

  const serials = useMemo(
    () => ProductSerialList?.serials || [],
    [ProductSerialList],
  );

  const tableData = useMemo(
    () =>
      ProductDocumentData?.map((product) => ({
        ...product,
        key: product.id,
      })) || [],
    [ProductDocumentData],
  );

  const SerialListOption = useMemo(
    () =>
      serials.map((serial) => ({
        value: serial.id,
        label: serial.full_serial || `سریال ${serial.id} `,
      })),
    [serials],
  );

  const handleEditLogEdition = useCallback(
    (logRecord) => {
      setModal({ mode: "edit", data: logRecord, type: "AddLogEdition" });
    },
    [setModal],
  );

  const handleShowDetailEdiotnLog = useCallback(
    (logRecord) => {
      setModal({
        mode: "view",
        data: { logRecord, ProductDocumentData: ProductDocumentData },
        type: "EditionDetailView",
      });
    },
    [setModal, ProductDocumentData],
  );

  const handleDeleteLogEdition = useCallback(
    async (logRecord) => {
      Modal.confirm({
        title: "حذف لاگ",
        content: "از حذف این لاگ مطمئن هستید؟",
        okText: "بله، مطمئنم",
        cancelText: "خیر، منصرف شدم.",
        async onOk() {
          try {
            await deleteProductEditionlog(logRecord.id);
            message.success("لاگ با موفقیت حذف شد");
            await refetchProductDocumentData();
          } catch (error) {
            message.error(error?.detail);
            console.error(error);
          }
        },
        onCancel() {
          message.warning("عملیات حذف لغو شد");
        },
      });
    },
    [deleteProductEditionlog, refetchProductDocumentData],
  );


  const handleConfirmDocument = useCallback(
    (record) => {
      const editionId = record?.editionData?.id;

      if (!editionId) {
        message.error("نسخه سند برای تایید پیدا نشد");
        return;
      }

      Modal.confirm({
        title: "تایید اسناد",
        content: "آیا از تایید این سند مطمئن هستید؟",
        okText: "بله، تایید شود",
        cancelText: "خیر، منصرف شدم",
        async onOk() {
          try {
            await updateDocumentState({
              id: editionId,
              state: 30,
              comment: "تایید سند از کارتابل شخصی",
            });
            message.success("سند با موفقیت تایید شد");
            await refetchProductDocumentData();
          } catch (error) {
            console.error(error);
            message.error(
              error?.response?.data?.detail ||
                error?.detail ||
                "خطا در تایید سند",
            );
          }
        },
      });
    },
    [updateDocumentState, refetchProductDocumentData],
  );

  const expandedRowRender = useCallback(
    (productRecord) => (
      <DocumentsTable
        documents={productRecord.documents}
        canViewEdition={fileAccess.canViewEdition}
        onDelete={handleDeleteLogEdition}
        onView={handleShowDetailEdiotnLog}
        onConfirm={handleConfirmDocument}
      />
    ),
    [
      handleEditLogEdition,
      handleDeleteLogEdition,
      handleShowDetailEdiotnLog,
      handleConfirmDocument,
      fileAccess.canViewEdition,
    ],
  );

  const handleSerialChange = useCallback(
    (value, option) => {
      setSerialId(value);
      setSerialLabel(option.label);
    },
    [setSerialId, setSerialLabel],
  );

  return (
    <>
      <Form.Item
        label={`سریال های ${currentProduct?.name}`}
        layout="vertical"
        className=""
      >
        <Select
          className="w-full"
          options={SerialListOption}
          value={serialId ?? undefined}
          loading={isFetchingSerials}
          disabled={!currentProduct?.id || (isFetchingSerials && ProductSerialList == null)}
          onChange={handleSerialChange}
          placeholder="انتخاب سریال"
        />
      </Form.Item>
      {isSerialsError && currentProduct?.id && (
        <Alert type="error" showIcon className="mb-2" message="خطا در دریافت سریال‌ها"
          action={<Button onClick={() => refetchSerials()}>تلاش دوباره</Button>} />
      )}
      <Card
        className="shadow-sm border-gray-100 overflow-hidden"
        title={
          <div className="flex items-center justify-between w-full py-1">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-blue-600 rounded-full" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800 leading-none">
                  اسناد و تاریخچه تغییرات
                </span>
              </div>
            </div>
          </div>
        }
      >
        {!serialId ? (
          <Empty description="برای مشاهده اسناد، ابتدا یک سریال انتخاب کنید" />
        ) : isFetchingDocuments && ProductDocumentData == null ? (
          <div role="status" className="flex justify-center items-center min-h-[160px]">
            <Spin tip="در حال بارگذاری اسناد..." size="large">
              <div style={{ minWidth: 180, minHeight: 80 }} />
            </Spin>
          </div>
        ) : isDocumentsError && ProductDocumentData == null ? (
          <Alert type="error" showIcon message="خطا در بارگذاری اسناد سریال"
            action={<Button onClick={() => refetchProductDocumentData()}>تلاش دوباره</Button>} />
        ) : (
          <>
            {isFetchingDocuments && ProductDocumentData != null && (
              <div role="status" className="mb-2"><Spin size="small" /> در حال به‌روزرسانی...</div>
            )}
            {isDocumentsError && ProductDocumentData != null && (
              <Alert type="error" showIcon className="mb-2"
                message="به‌روزرسانی اسناد ناموفق بود؛ داده‌های قبلی نمایش داده می‌شوند"
                action={<Button onClick={() => refetchProductDocumentData()}>تلاش دوباره</Button>} />
            )}
            {tableData.length ? (
              <TableAntd
                className="rtl-table--fit"
                scroll={{}}
                tableLayout="fixed"
                dataSource={tableData}
                columns={ProductDocumentListSerialCol}
                expandable={{
                  expandedRowRender,
                  rowExpandable: (record) => record.documents && record.documents.length > 0,
                }}
              />
            ) : <Empty description="سندی برای این سریال ثبت نشده است" />}
          </>
        )}
      </Card>
    </>
  );
};

export default ProductDocumentListSerial;
