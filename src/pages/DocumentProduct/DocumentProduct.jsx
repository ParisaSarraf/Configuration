import { Card } from "antd";
import useModal from "../../hooks/useModal";
import { useDocumentList } from "../../QueryServises/documentQuery";
import { useProductContext } from "../../Services/Context/ProductContext";
import DocumentProductModal from "./components/DocumentProductModal";
import ProductDocumentTree from "./components/ProductDocumentTree";
import ProductDocumentEditionModal from "./components/ProductDocumentEdition/ProductDocumentEditionModal";

const ProductDocuments = () => {
    const { isOpen, modalMode, modalData, modalType, setModal, closeModal } = useModal();
    const { refetch } = useDocumentList()
    const { currentProduct } = useProductContext();

    return (
        <>
            <Card
                title={` اسناد ${currentProduct?.name || ''}`}
            // extra={


            // }
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                    <div className="col-span-1">
                        <Card
                            extra={
                                <DocumentProductModal
                                    currentProduct={currentProduct}
                                    isOpen={isOpen && modalType === 'add'}
                                    modalMode={modalMode}
                                    modalData={modalData}
                                    modalType={modalType}
                                    closeModal={closeModal}
                                    setModal={setModal}
                                    refetch={refetch}
                                />}
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
            </Card >
        </>
    );
};

export default ProductDocuments