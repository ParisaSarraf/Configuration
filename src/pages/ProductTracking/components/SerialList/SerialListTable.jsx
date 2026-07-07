import { message, Modal } from "antd";
import { SerialListCol } from "./SerialListCol";
import {
  useDeleteProductSerial,
  useProductSerialById,
} from "../../../../QueryServises/productSerialQuery";
import { useEffect } from "react";
import { useResizableColumns } from "../../../../hooks/useResizableColumns.jsx";
import { TableAntd } from "../../../../components/TableAntd/TableAntd.jsx";

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

  useEffect(() => {
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
    <TableAntd
      components={components}
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
  );
};

export default SerialListTable;
