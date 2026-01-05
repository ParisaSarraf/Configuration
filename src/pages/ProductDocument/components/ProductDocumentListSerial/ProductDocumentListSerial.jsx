import { useCallback, useMemo } from "react";
import {
  Button,
  Card,
  Form,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tooltip,
} from "antd";
import { useProductSerialById } from "@/QueryServises/productSerialQuery/index.js";
import { useProductDocumentEditionLogsBySerialById } from "@/QueryServises/productDocumentQuery/index.js";
import { ProductDocumentListSerialCol } from "./components/ProductDocumentListSerialCol";
import { useDeleteProductEditionlog } from "@/QueryServises/productDocumentEditionLogQuery/index.js";
import { DeleteOutlined, EyeFilled, FileZipOutlined } from "@ant-design/icons";
import { georgianDateToJalaliDate } from "@utils/timeTool.jsx";
import { BASEURL } from "@/Services/axiosInstance.js";
import { useGetZipById } from "../../../../QueryServises/productDocumentQuery";

const EditionsAndLogsTable = ({ editions, onEdit, onDelete, onView }) => {
  const processedData = useMemo(() => {
    const flatData = [];
    editions?.forEach((edition) => {
      const { logs, ...editionDetails } = edition;
      const logCount = logs?.length || 0;

      if (logCount === 0) {
        flatData.push({
          ...editionDetails,
          key: `edition-${edition.id}`,
          logData: null,
          rowSpan: 1,
        });
      } else {
        logs.forEach((log, index) => {
          flatData.push({
            ...editionDetails,
            key: `log-${log.id}`,
            logData: log,
            rowSpan: index === 0 ? logCount : 0,
          });
        });
      }
    });
    return flatData;
  }, [editions]);

  console.log(processedData);

  const mergedColumns = useMemo(
    () => [
      {
        title: "نسخه",
        dataIndex: "edition",
        key: "edition",
        onCell: (record) => ({ rowSpan: record.rowSpan }),
      },
      {
        title: "کد سند",
        dataIndex: "full_code",
        key: "full_code",
        onCell: (record) => ({ rowSpan: record.rowSpan }),
        render: (text) => text || "---",
      },
      {
        title: "تاریخ بازبینی",
        dataIndex: ["logData", "survey_date"],
        key: "log_survey_date",
        render: (date) => (date ? georgianDateToJalaliDate(date) : "---"),
      },
      // {
      //     title: "توضیحات",
      //     dataIndex: ["logData", "description"],
      //     key: "log_description",
      //     render: (text) => text || "---",
      // },
      {
        title: "فایل",
        dataIndex: ["logData", "file"],
        key: "log_file",
        render: (fileUrl) =>
          fileUrl ? (
            <a
              href={`${BASEURL.replace("/api/v1", "")}${fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
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
              {/* <Tooltip title="ویرایش ">*/}
              {/*  <Button*/}
              {/*    size="small"*/}
              {/*    icon={<EditOutlined />}*/}
              {/*    className="text-green-500 border-green-500"*/}
              {/*    onClick={() => onEdit(record)}*/}
              {/*  />*/}
              {/*</Tooltip>*/}
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
            </Space>
          ) : null,
      },
    ],
    [onEdit, onDelete, onView]
  );

  return (
    <Table
      columns={mergedColumns}
      dataSource={processedData}
      size="small"
      bordered
      pagination={false}
      scroll={{ x: "max-content" }}
    />
  );
};

const DocumentsTable = ({ documents, onEdit, onDelete, onView }) => {
  const documentColumns = useMemo(
    () => [
      { title: "عنوان سند", dataIndex: "title", key: "title" },
      {
        title: "کد",
        key: "full_code",
        render: (doc) => doc.document?.full_code,
      },
      {
        title: "تاریخ بازبینی",
        dataIndex: "survey_date",
        key: "survey_date",
        render: (survey_date) => {
          return georgianDateToJalaliDate(survey_date);
        },
      },
    ],
    []
  );

  const documentData = useMemo(
    () => documents?.map((doc) => ({ ...doc, key: doc.id })) || [],
    [documents]
  );

  const renderEditionsAndLogs = useCallback(
    (documentRecord) => (
      <EditionsAndLogsTable
        editions={documentRecord.editions}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
      />
    ),
    [onEdit, onDelete, onView]
  );

  return (
    <Table
      columns={documentColumns}
      dataSource={documentData}
      size="small"
      pagination={false}
      expandable={{
        expandedRowRender: renderEditionsAndLogs,
        rowExpandable: (record) =>
          record.editions && record.editions.length > 0,
      }}
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
  const { data: ProductSerialList } = useProductSerialById(currentProduct?.id);
  const { mutateAsync: deleteProductEditionlog } = useDeleteProductEditionlog();
  const { data: ProductDocumentData, refetch: refetchProductDocumentData } =
    useProductDocumentEditionLogsBySerialById(serialId);

  const { isFetching: isZipLoading, refetch: fetchZip } = useGetZipById(
    currentProduct?.id
  );

  // const handleDownloadZip = async () => {
  //   const hide = message.loading("در حال آماده‌سازی فایل ZIP...", 0);
  //   try {
  //     const { data: blobData } = await fetchZip();
  //     if (blobData) {
  //       const url = window.URL.createObjectURL(new Blob([blobData]));
  //       const link = document.createElement("a");
  //       link.href = url;
  //       link.setAttribute(
  //         "download",
  //         `Documents-${currentProduct?.name || "Product"}.zip`
  //       );
  //       document.body.appendChild(link);
  //       link.click();
  //       link.parentNode.removeChild(link);
  //       window.URL.revokeObjectURL(url);
  //       message.success("فایل با موفقیت دانلود شد");
  //     }
  //   } catch (error) {
  //     message.error("خطا در دریافت فایل ZIP");
  //   } finally {
  //     hide();
  //   }
  // };

  const serials = useMemo(
    () => ProductSerialList?.serials || [],
    [ProductSerialList]
  );

  const tableData = useMemo(
    () =>
      ProductDocumentData?.map((product) => ({
        ...product,
        key: product.id,
      })) || [],
    [ProductDocumentData]
  );

  const SerialListOption = useMemo(
    () =>
      serials.map((serial) => ({
        value: serial.id,
        label: serial.full_serial || `سریال ${serial.id} `,
      })),
    [serials]
  );

  const handleEditLogEdition = useCallback(
    (logRecord) => {
      setModal({ mode: "edit", data: logRecord, type: "AddLogEdition" });
    },
    [setModal]
  );

  const handleShowDetailEdiotnLog = useCallback(
    (logRecord) => {
      setModal({
        mode: "view",
        data: { logRecord, ProductDocumentData: ProductDocumentData },
        type: "EditionDetailView",
      });
    },
    [setModal]
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
    [deleteProductEditionlog, refetchProductDocumentData]
  );

  const expandedRowRender = useCallback(
    (productRecord) => (
      <DocumentsTable
        documents={productRecord.documents}
        onEdit={handleEditLogEdition}
        onDelete={handleDeleteLogEdition}
        onView={handleShowDetailEdiotnLog}
      />
    ),
    [handleEditLogEdition, handleDeleteLogEdition, handleShowDetailEdiotnLog]
  );

  const handleSerialChange = useCallback(
    (value, option) => {
      setSerialId(value);
      setSerialLabel(option.label);
    },
    [setSerialId, setSerialLabel]
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
          onChange={handleSerialChange}
          placeholder="انتخاب سریال"
        />
      </Form.Item>
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

            {/* <Button
              type="primary"
              icon={
                <FileZipOutlined
                  className={isZipLoading ? "" : "animate-bounce-short"}
                />
              }
              loading={isZipLoading}
              onClick={handleDownloadZip}
              className="
          flex items-center gap-2 px-4 
          bg-gradient-to-r from-blue-600 to-indigo-600 
          border-none hover:from-blue-700 hover:to-indigo-700 
          shadow-md shadow-blue-100 hover:shadow-lg 
          transition-all duration-300 rounded-md
          h-8 text-[12px]
        "
            >
              {!isZipLoading && "دریافت خروجی ZIP"}
            </Button> */}

          </div>
        }
      >
        <Table
          bordered
          pagination={false}
          dataSource={tableData}
          columns={ProductDocumentListSerialCol}
          size="small"
          expandable={{
            expandedRowRender,
            rowExpandable: (record) =>
              record.documents && record.documents.length > 0,
          }}
          locale={{
            emptyText: (
              <div className="py-10">
                <p className="text-gray-400">
                  لطفاً برای مشاهده اسناد، ابتدا یک سریال انتخاب کنید
                </p>
              </div>
            ),
          }}
        />
      </Card>
    </>
  );
};

export default ProductDocumentListSerial;
