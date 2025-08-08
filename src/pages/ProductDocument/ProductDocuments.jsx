import {Card} from "antd";
import useModal from "../../hooks/useModal";
import {useProductContext} from "../../Services/Context/ProductContext";
import DocumentProductModal from "./components/DocumentProductModal";
import ProductDocumentTree from "./components/ProductDocumentTree";
import ProductDocumentEditionModal from "./components/ProductDocumentEdition/ProductDocumentEditionModal";
import ProductDocumentListSerial from "./components/ProductDocumentListSerial/ProductDocumentListSerial";
import AddProductDocumentListSerialLogModal
    from "./components/ProductDocumentListSerial/components/AddProductDocumentListSerialLogModal";
import {useEffect, useState} from "react";
import {
    useProductDocumentEditionLogsBySerialById,
    useProductDocumentTreeById
} from "../../QueryServises/productDocumentQuery";
import EditionDetailViewModal from "./components/ProductDocumentListSerial/components/EditionDetailViewModal";
import DetailModal from "@/pages/Meetings/components/DetailModal.jsx";
import AutomationFileModal from "@/pages/ProductDocument/components/AutomationFileModal/AutomationFileModal.jsx";
import ProductDocumentEditionFiles
    from "@/pages/ProductDocument/components/ProductDocumentEditionFiles/ProductDocumentEditionFiles.jsx";

const ProductDocuments = () => {
    const {currentProduct} = useProductContext();
    const {isOpen, modalMode, modalData, modalType, setModal, closeModal} = useModal();
    const {refetch} = useProductDocumentTreeById(currentProduct?.id)
    const [serialId, setSerialId] = useState(null)
    const {refetch: refetchSerialId} = useProductDocumentEditionLogsBySerialById(serialId)

    useEffect(() => {
        setSerialId(null);
    }, [currentProduct?.id]);

    return (
        <>
            <Card
                title={` اسناد ${currentProduct?.name || ''}`}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                    <div className="col-span-1">
                        <Card
                            title="پنجره اسناد"
                            extra={
                                <DocumentProductModal
                                    currentProduct={currentProduct}
                                    isOpen={isOpen && modalType === 'AddDocumentProduct'}
                                    modalMode={modalMode}
                                    modalData={modalData}
                                    modalType={modalType}
                                    closeModal={closeModal}
                                    setModal={setModal}
                                    refetch={refetch}
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
                                <AddProductDocumentListSerialLogModal
                                    serialId={serialId}
                                    currentProduct={currentProduct}
                                    isOpen={isOpen && modalType === 'AddLogEdition'}
                                    modalMode={modalMode}
                                    modalData={modalData}
                                    modalType={modalType}
                                    closeModal={closeModal}
                                    setModal={setModal}
                                    refetchSerialId={refetchSerialId}
                                />
                            }
                        >
                            <ProductDocumentListSerial
                                setModal={setModal}
                                modalType={modalType}
                                refetchSerialId={refetchSerialId}
                                setSerialId={setSerialId}
                                serialId={serialId}
                                currentProduct={currentProduct}

                            />
                        </Card>
                    </div>
                </div>

                <ProductDocumentEditionModal
                    isOpen={isOpen && modalType === 'edition'}
                    modalMode={modalMode}
                    modalData={modalData}
                    closeModal={closeModal}
                    setModal={setModal}
                    currentProduct={currentProduct}
                    refetch={refetch}
                />

                <EditionDetailViewModal
                    isOpen={modalType === 'EditionDetailView' && isOpen}
                    modalMode={modalMode}
                    modalType={modalType}
                    modalData={modalData}
                    closeModal={closeModal}
                />

                <DetailModal
                    isOpen={modalType === 'EditionDetail' && isOpen
                    }
                    modalMode={modalMode}
                    modalData={modalData}
                    closeModal={closeModal}
                    modalType={modalType}
                />

                <AutomationFileModal
                    isOpen={modalType === 'AutomationFiles' && isOpen}
                    modalData={modalData}
                    modalMode={modalMode}
                    modalType={modalType}
                    closeModal={closeModal}
                />

                <ProductDocumentEditionFiles
                    isOpen={modalType === 'ProductDocumentEditionsFile' && isOpen}
                    modalData={modalData}
                    modalMode={modalMode}
                    modalType={modalType}
                    closeModal={closeModal}
                    currentProduct={currentProduct}
                    refetch={refetch}
                />


            </Card>
        </>
    );
};

export default ProductDocuments