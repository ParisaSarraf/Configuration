import { Button, message, Modal } from "antd";
import { FileExcelOutlined, ApartmentOutlined } from "@ant-design/icons";
import { SerialListCol } from "./SerialListCol.jsx";
import {
  useDeleteProductSerial,
  useProductSerialById,
  useExportProductSerialsCsv,
  useExportSerialDescendantsCsv,
} from "../../../../QueryServises/productSerialQuery/index.js";
import { useEffect, useState } from "react";
import { useResizableColumns } from "../../../../hooks/useResizableColumns.jsx";
import { TableAntd } from "../../../../components/TableAntd/TableAntd.jsx";
import { handleDownload } from "@/utils/HandleDownload";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import SerialContextMenuRow from "./SerialContextMenuRow";
import SerialTreeModal from "./SerialTreeModal";

const SerialListTable = ({
  setModal,
  currentProduct,
  setSelectedRowId,
  selectedRowId,
  setSelectedParentId,
}) => {
  const { data: productSerial, refetch } = useProductSerialById(
    currentProduct?.id,
  );
  const { mutateAsync: deleteProductSerial } = useDeleteProductSerial();
  const exportSerials = useExportProductSerialsCsv();
  const exportDescendants = useExportSerialDescendantsCsv();
  const [treeSerial, setTreeSerial] = useState(null);

  const handleExportSerials = async () => {
    if (!currentProduct?.id || exportSerials.isPending) return;
    try {
      const blob = await exportSerials.mutateAsync(currentProduct.id);
      handleDownload(
        window.URL.createObjectURL(blob),
        `product_${currentProduct.id}_serials.csv`,
      );
    } catch (error) {
      message.error(getApiErrorMessage(error, "دریافت خروجی سریال‌های محصول انجام نشد."));
    }
  };

  const handleExportSerial = async (serialId) => {
    if (!serialId || exportDescendants.isPending) return;
    try {
      const blob = await exportDescendants.mutateAsync(serialId);
      handleDownload(
        window.URL.createObjectURL(blob),
        `serial_${serialId}_descendants.csv`,
      );
    } catch (error) {
      message.error(getApiErrorMessage(error, "دریافت خروجی سریال و زیرمجموعه‌های آن انجام نشد."));
    }
  };

  const serialRowProps = (record) => ({
    serialMenu: {
      items: [{
        key: "export-descendants",
        icon: <FileExcelOutlined />,
        label: "خروجی سریال به همراه زیر مجموعه‌هاش",
        disabled: !record?.id || exportDescendants.isPending,
      }, {
        key: "show-tree",
        icon: <ApartmentOutlined />,
        label: "نمایش درخت سریال",
        disabled: !record?.id,
      }],
      onClick: ({ key, domEvent }) => {
        domEvent?.stopPropagation();
        if (key === "export-descendants")
          return handleExportSerial(record.id);
        if (key === "show-tree" && record?.id)
          setTreeSerial({ id: record.id, label: record.full_serial ?? record.serial ?? String(record.id) });
      },
    },
  });

  useEffect(() => {
    setTreeSerial(null);
    refetch();
  }, [currentProduct?.id, refetch]);

  const handleEditProductSerial = (record) => {
    setModal({ mode: "edit", data: record, type: "ProductSerial" });
  };

  const handleDeleteProductSerial = async (id) => {
    Modal.confirm({
      title: "حذف سریال",
      content: "آیا از حذف این سریال مطمئن هستید؟",
      okText: "بله",
      cancelText: "خیر",
      onOk: async () => {
        try {
          await deleteProductSerial(id);
          message.success("سریال با موفقیت حذف شد");
          await refetch();
        } catch (error) {
          console.error(error);
        }
      },
    });
  };

  const baseColumns = SerialListCol(
    handleEditProductSerial,
    handleDeleteProductSerial,
  );
  const { resizableColumns, components } = useResizableColumns(baseColumns);

  return (
    <div className="min-w-0" dir="rtl">
      <div className="mb-3 flex justify-start">
        <Button
          icon={<FileExcelOutlined />}
          loading={exportSerials.isPending}
          disabled={!currentProduct?.id}
          onClick={handleExportSerials}
        >
          خروجی اکسل
        </Button>
      </div>
      <TableAntd
        components={{
          ...components,
          body: { ...components?.body, row: SerialContextMenuRow },
        }}
        onRow={serialRowProps}
        columns={resizableColumns}
        dataSource={productSerial?.serials}
        rowKey="id"
        rowSelection={{
          type: "radio",
          selectedRowKeys: selectedRowId ? [selectedRowId] : [],
          onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowId(selectedRowKeys[0] || null);
            setSelectedParentId(selectedRows[0].id);
          },
        }}
      />
      <SerialTreeModal
        open={Boolean(treeSerial)}
        serialId={treeSerial?.id}
        serialLabel={treeSerial?.label}
        productId={currentProduct?.id}
        onClose={() => setTreeSerial(null)}
      />
    </div>
  );
};

export default SerialListTable;
