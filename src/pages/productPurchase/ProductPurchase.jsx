import { Button, Card, Modal, Tabs } from "antd";
import { useProductContext } from "../../Services/Context/ProductContext";
import RequestOfWarehouse from "./components/RequestOfWarehouse/RequestOfWarehouse";
import PurchaseProductTable from "./components/PurchaseProductTable/PurchaseProductTable";
import PurchaseModal from "./components/PurchaseModal/PurchaseModal";
import useModal from "../../hooks/useModal";
import {
  ExclamationCircleOutlined,
  FileExcelOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useUnConfirmProductPurchaseById } from "../../QueryServises/productPurchase";
import ListOfRequestsMade from "./components/ListOfRequestsMade/ListOfRequestsMade";
import { useExportExcelMainProductPurchase } from "../../QueryServises/ExcelExporterQuery";
import { handleDownload } from "@utils/HandleDownload.js";
import ExportPurchaseExcelModal from "../../components/exportPurchaseExcelModal";

const ProductPurchase = () => {
  const { currentProduct } = useProductContext();
  const { refetch } = useUnConfirmProductPurchaseById(currentProduct?.id);
  const { isOpen, modalMode, modalData, modalType, setModal, closeModal } =
    useModal();
  const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);
  const [selectedPurchaseType, setSelectedPurchaseType] = useState(false);

  const [exportExcelData, setExportExcelData] = useState(null);

  const { data: exportExcel, refetch: refetchExport } =
    useExportExcelMainProductPurchase(currentProduct?.id, { enabled: false });

  useEffect(() => {
    setSelectedPurchaseId(null);
  }, [currentProduct?.id]);

  useEffect(() => {
    if (exportExcelData) refetchExport();
  }, [exportExcelData, refetchExport]);

  useEffect(() => {
    if (exportExcel && exportExcelData) {
      handleDownload(exportExcel, `purchase_list_${exportExcelData}.csv`);
      setExportExcelData(null);
    }
  }, [exportExcel, exportExcelData]);

  const items = [
    {
      key: "1",
      label: "لیست درخواست خرید",
      children: (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            <div className="col-span-1">
              <PurchaseProductTable
                key={currentProduct?.id}
                currentProduct={currentProduct}
                setSelectedPurchaseId={setSelectedPurchaseId}
                setModal={setModal}
                setSelectedPurchaseType={setSelectedPurchaseType}
              />
            </div>
            <div className="col-span-1">
              <RequestOfWarehouse
                selectedPurchaseId={selectedPurchaseId}
                setSelectedPurchaseType={setSelectedPurchaseType}
                selectedPurchaseType={selectedPurchaseType}
                currentProduct={currentProduct}
                refetchUnconfirmed={refetch}
              />
            </div>
          </div>
        </>
      ),
    },
    {
      key: "2",
      label: "درخواست های انجام شده",
      children: (
        <ListOfRequestsMade currentProduct={currentProduct} refetch={refetch} />
      ),
    },
  ];

  const handleSCVdownload = () => {
    Modal.confirm({
      title: "دانلود فایل اکسل",
      content: "آیا مایل به ایجاد و دانلود فایل اکسل هستید؟",
      centered: true,
      okText: "دانلود",
      cancelText: "انصراف",
      okType: "primary",
      maskClosable: true,
      onOk: async () => {
        setExportExcelData(await exportExcel);
      },
    });
  };

  return (
    <Card
      title={`درخواست خرید ${currentProduct?.name}`}
      extra={
        <div className="w-full flex flex-row gap-2">
          <Button
            icon={<PlusOutlined />}
            className="modal-button"
            onClick={() =>
              setModal({ mode: "add", data: null, type: "purchaseModal" })
            }
            title="درخواست خرید"
          />
          <Button
            icon={<FileExcelOutlined />}
            title={"خروجی اکسل"}
            className={"text-green-500 border-green-500 mt-4"}
            onClick={() => handleSCVdownload()}
          />
        </div>
      }
    >
      <div>
        <Tabs items={items} type="card" />
        <PurchaseModal
          currentProduct={currentProduct}
          isOpen={isOpen}
          modalMode={modalMode}
          modalData={modalData}
          modalType={modalType}
          closeModal={closeModal}
          setModal={setModal}
          refetch={refetch}
        />
      </div>
    </Card>
  );
};

export default ProductPurchase;
