import { useCallback, useMemo } from "react";
import { Card, Form, message, Modal, Select } from "antd";
import { useProductSerialById } from "@/QueryServises/productSerialQuery/index.js";
import { useProductDocumentEditionLogsBySerialById } from "@/QueryServises/productDocumentQuery/index.js";
import { ProductDocumentListSerialCol } from "./components/ProductDocumentListSerialCol";
import { useDeleteProductEditionlog } from "@/QueryServises/productDocumentEditionLogQuery/index.js";
import { TableAntd } from "../../../../components/TableAntd/TableAntd";

const DocumentsTable = ({ documents }) => {
  const documentColumns = useMemo(
    () => [
      {
        title: "عنوان سند",
        dataIndex: "title",
        key: "title",
        // render: (doc) => `${doc.document?.full_code} / ${editionDoc.full_code}`,
        render: (_, doc) =>
          `${doc.document?.full_code} / ${doc.editions?.[0]?.full_code ?? ""}`,
      },
      {
        title: "کد",
        key: "full_code",
        render: (doc) => doc.document?.full_code,
      },
      // {
      //   title: "تاریخ بازبینی",
      //   dataIndex: "survey_date",
      //   key: "survey_date",
      //   render: (doc) => {
      //     return georgianDateToJalaliDate(doc.editions.logs[0].survey_date);
      //   },
      // },
    ],
    [],
  );

  const documentData = useMemo(
    () => documents?.map((doc) => ({ ...doc, key: doc.id })) || [],
    [documents],
  );

  // const renderEditionsAndLogs = useCallback(
  //   (documentRecord) => (
  //     <EditionsAndLogsTable
  //       editions={documentRecord.editions}
  //       onEdit={onEdit}
  //       onDelete={onDelete}
  //       onView={onView}
  //     />
  //   ),
  //   [onEdit, onDelete, onView]
  // );

  return (
    <TableAntd
      columns={documentColumns}
      dataSource={documentData}
      size="small"
      pagination={false}
      expandable={{
        // expandedRowRender: renderEditionsAndLogs,
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
    [setModal],
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
