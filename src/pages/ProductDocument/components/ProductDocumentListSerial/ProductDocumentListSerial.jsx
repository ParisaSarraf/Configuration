import { useMemo, useCallback } from "react";
import {
  Button,
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
import { DeleteOutlined, EditOutlined, EyeFilled } from "@ant-design/icons";
import { georgianDateToJalaliDate } from "@utils/timeTool.jsx";
import { BASEURL } from "../../../../Services/axiosInstance";

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

  const mergedColumns = useMemo(
    () => [
      {
        title: "نسخه",
        dataIndex: "edition",
        key: "edition",
        onCell: (record) => ({ rowSpan: record.rowSpan }),
      },
      {
        title: "توضیحات",
        dataIndex: "description",
        key: "edition_description",
        onCell: (record) => ({ rowSpan: record.rowSpan }),
        render: (text) => text || "---",
      },
      {
        title: "تاریخ بازبینی",
        dataIndex: ["logData", "survey_date"],
        key: "log_survey_date",
        render: (date) => (date ? georgianDateToJalaliDate(date) : "---"),
      },
      {
        title: "توضیحات",
        dataIndex: ["logData", "description"],
        key: "log_description",
        render: (text) => text || "---",
      },
      {
        title: "فایل",
        dataIndex: ["logData", "file"],
        key: "log_file",
        render: (fileUrl) =>
          fileUrl ? (
            <a href={`${BASEURL.replace("/api/v1", "")}${fileUrl}`} target="_blank" rel="noopener noreferrer">
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
      pagination={false}
      size="small"
      bordered
      scroll={{ x: "max-content" }}
    />
  );
};

const DocumentsTable = ({ documents, onEdit, onDelete, onView }) => {
  const documentColumns = useMemo(
    () => [
      { title: "عنوان سند", dataIndex: "title", key: "title" },
      { title: "کد", key: "code", render: (doc) => doc.document?.code },
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
      pagination={false}
      size="small"
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
        label: serial.serial || `سریال ${serial.id}`,
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
      setModal({ mode: "view", data: {logRecord, ProductDocumentData:ProductDocumentData}, type: "EditionDetailView" });
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
      <Table
        title={() => `اسناد log ${currentProduct?.name} و زیرمجموعه ها`}
        bordered
        dataSource={tableData}
        columns={ProductDocumentListSerialCol}
        size="small"
        pagination={{ pageSize: 3 }}
        expandable={{
          expandedRowRender,
          rowExpandable: (record) =>
            record.documents && record.documents.length > 0,
        }}
        locale={{ emptyText: "باید یک سریال انتخاب کنید" }}
      />
    </>
  );
};

export default ProductDocumentListSerial;
