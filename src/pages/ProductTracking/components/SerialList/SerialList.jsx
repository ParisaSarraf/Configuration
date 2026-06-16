import SerialListTable from "./SerialListTable";
import SerialListModal from "./SerialListModal";
import { useProductSerialById } from "@/QueryServises/productSerialQuery/index.js";
import { useEffect } from "react";

const SerialList = ({
  isOpen,
  modalMode,
  modalData,
  modalType,
  closeModal,
  setModal,
  currentProduct,
  selectedRowId,
  setSelectedRowId,
  setSelectedParentId,
}) => {
  const { refetch } = useProductSerialById(currentProduct?.id);

  useEffect(() => {
    setSelectedRowId(null);
  }, [currentProduct?.id, setSelectedRowId]);

  return (
    <>
      <SerialListTable
        key={currentProduct?.id}
        currentProduct={currentProduct}
        isOpen={isOpen}
        setSelectedRowId={setSelectedRowId}
        selectedRowId={selectedRowId}
        modalMode={modalMode}
        setSelectedParentId={setSelectedParentId}
        modalData={modalData}
        closeModal={closeModal}
        setModal={setModal}
      />
      <SerialListModal
        currentProduct={currentProduct}
        isOpen={modalType === "ProductSerial" && isOpen}
        modalMode={modalMode}
        modalData={modalData}
        closeModal={closeModal}
        setModal={setModal}
        refetch={refetch}
      />
    </>
  );
};

export default SerialList;
