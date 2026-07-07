import { Button, Card } from "antd";
import useModal from "../../hooks/useModal";
import { useProductContext } from "../../Services/Context/ProductContext";
import DocumentProductModal from "./components/DocumentProductModal";
import ProductDocumentTree from "./components/ProductDocumentTree";
import ProductDocumentEditionModal from "./components/ProductDocumentEdition/ProductDocumentEditionModal";
import ProductDocumentListSerial from "./components/ProductDocumentListSerial/ProductDocumentListSerial";
import AddProductDocumentListSerialLogModal from "./components/ProductDocumentListSerial/components/AddProductDocumentListSerialLogModal";
import { useEffect, useState } from "react";
import {
  useExportExcelSerial,
  useProductDocumentEditionLogsBySerialById,
  useProductDocumentTreeById,
} from "../../QueryServises/productDocumentQuery";
import EditionDetailViewModal from "./components/ProductDocumentListSerial/components/EditionDetailViewModal";
import DetailModal from "@/components/DetailModal/DetailModal.jsx";
import CombineFiles from "@/pages/ProductDocument/components/CombineFiles/CombineFiles.jsx";
import { PlusOutlined } from "@ant-design/icons";
import ExportExcelButton from "../../components/ExportExcel/ExportExcel";

const ProductDocuments = () => {
  const { currentProduct } = useProductContext();
  const { isOpen, modalMode, modalData, modalType, setModal, closeModal } =
    useModal();
  const { refetch } = useProductDocumentTreeById(currentProduct?.id);
  const [serialId, setSerialId] = useState(null);
  const [serialLabel, setSerialLabel] = useState("");
  const { refetch: refetchSerialId } =
    useProductDocumentEditionLogsBySerialById(serialId);
  const { mutateAsync: exportExcel, isLoading: isExporting } =
    useExportExcelSerial();

  useEffect(() => {
    setSerialId(null);
  }, [currentProduct?.id]);

  return (
    <Card title={` اسناد ${currentProduct?.name || ""}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        <div className="col-span-1">
          <Card
            title="پنجره اسناد"
            extra={
              <Button
                className="modal-button"
                icon={<PlusOutlined />}
                onClick={() =>
                  setModal({
                    mode: "add",
                    data: null,
                    type: "AddDocumentProduct",
                  })
                }
              />
            }
          >
            <ProductDocumentTree
              setModal={setModal}
              modalType={modalType}
              refetch={refetch}
              currentProduct={currentProduct}
            />
          </Card>
        </div>
        <div className="col-span-1">
          <Card
            title="سریال ها"
            extra={
              <div className="flex flex-row gap-2">
                <AddProductDocumentListSerialLogModal
                  serialId={serialId}
                  currentProduct={currentProduct}
                  isOpen={isOpen && modalType === "AddLogEdition"}
                  modalMode={modalMode}
                  modalData={modalData}
                  modalType={modalType}
                  closeModal={closeModal}
                  setModal={setModal}
                  refetchSerialId={refetchSerialId}
                  serialLabel={serialLabel}
                />

                <ExportExcelButton
                  id={serialId}
                  fileName={serialLabel || "serial-export"}
                  FnName={exportExcel}
                  isLoading={isExporting}
                />
              </div>
            }
          >
            <ProductDocumentListSerial
              setModal={setModal}
              modalType={modalType}
              refetchSerialId={refetchSerialId}
              setSerialId={setSerialId}
              setSerialLabel={setSerialLabel}
              serialId={serialId}
              currentProduct={currentProduct}
            />
          </Card>
        </div>
      </div>

      <ProductDocumentEditionModal
        isOpen={isOpen && modalType === "edition"}
        modalMode={modalMode}
        modalData={modalData}
        closeModal={closeModal}
        setModal={setModal}
        currentProduct={currentProduct}
        refetch={refetch}
      />

      <EditionDetailViewModal
        isOpen={modalType === "EditionDetailView" && isOpen}
        modalMode={modalMode}
        modalType={modalType}
        modalData={modalData}
        closeModal={closeModal}
      />

      <DetailModal
        isOpen={modalType === "EditionDetail" && isOpen}
        modalMode={modalMode}
        modalData={modalData}
        closeModal={closeModal}
        modalType={modalType}
      />

      <CombineFiles
        isOpen={modalType === "AutomationFiles" && isOpen}
        modalData={modalData}
        modalMode={modalMode}
        modalType={modalType}
        closeModal={closeModal}
        refetch={refetch}
        currentProduct={currentProduct}
      />

      <DocumentProductModal
        currentProduct={currentProduct}
        isOpen={isOpen && modalType === "AddDocumentProduct"}
        modalMode={modalMode}
        modalData={modalData}
        modalType={modalType}
        closeModal={closeModal}
        setModal={setModal}
        refetch={refetch}
      />
    </Card>
  );
};

export default ProductDocuments;
