import { useCallback, useMemo } from "react";
import {
  Button,
  Card,
  Form,
  message,
  Modal,
  Select,
  Space,
  Tooltip,
} from "antd";
import { useProductSerialById } from "@/QueryServises/productSerialQuery/index.js";
import { useProductDocumentEditionLogsBySerialById } from "@/QueryServises/productDocumentQuery/index.js";
import { ProductDocumentListSerialCol } from "./components/ProductDocumentListSerialCol";
import { useDeleteProductEditionlog } from "@/QueryServises/productDocumentEditionLogQuery/index.js";
import { DeleteOutlined, EyeFilled } from "@ant-design/icons";
import { BASEURL } from "@/Services/axiosInstance.js";
import { TableAntd } from "../../../../components/TableAntd/TableAntd";
import { georgianDateToJalaliDate } from "../../../../utils/timeTool";

const DocumentsTable = ({ documents, onEdit, onDelete, onView }) => {
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
        title: "عنوان سند",
        dataIndex: "title",
        key: "title",
        onCell: (record) => ({ rowSpan: record.docRowSpan }),
        render: (_, record) => (record ? record.document?.full_code : "--"),
      },
      {
        title: "نسخه",
        key: "edition_full_code",
        onCell: (record) => ({ rowSpan: record.editionRowSpan }),
        render: (_, record) =>
          record.editionData?.full_code ? record.editionData?.full_code : "--",
      },
      {
        title: "تاریخ تهیه",
        key: "edition_survey_date",
        onCell: (record) => ({ rowSpan: record.editionRowSpan }),
        render: (_, record) =>
          record.logData?.survey_date
            ? georgianDateToJalaliDate(record.logData?.survey_date)
            : "--",
      },
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
    [onEdit, onDelete, onView],
  );

  return (
    <TableAntd
      rowKey="key"
      columns={documentColumns}
      dataSource={documentData}
      size="small"
      bordered
      pagination={false}
      scroll={{ x: "max-content" }}
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

  const expandedRowRender = useCallback(
    (productRecord) => (
      <DocumentsTable
        documents={productRecord.documents}
        onEdit={handleEditLogEdition}
        onDelete={handleDeleteLogEdition}
        onView={handleShowDetailEdiotnLog}
      />
    ),
    [handleEditLogEdition, handleDeleteLogEdition, handleShowDetailEdiotnLog],
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
          </div>
        }
      >
        <TableAntd
          pagination={false}
          dataSource={tableData}
          columns={ProductDocumentListSerialCol}
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
