import { Card } from "antd";
import useModal from "../../hooks/useModal";
import { useDocumentList } from "../../QueryServises/documentQuery";
import { useProductContext } from "../../Services/Context/ProductContext";
import DocumentProductModal from "./components/DocumentProductModal";
import ProductDocumentTree from "./components/ProductDocumentTree";



const ProductDocuments = () => {
    const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
    const { refetch } = useDocumentList()
    const { currentProduct } = useProductContext();

    return (
        <>
            <Card
                title={` اسناد ${currentProduct?.name || ''}`}
                extra={
                    <DocumentProductModal
                        currentProduct={currentProduct}
                        isOpen={isOpen}
                        modalMode={modalMode}
                        modalData={modalData}
                        closeModal={closeModal}
                        setModal={setModal}
                        refetch={refetch}
                    />
                }
            >
                <ProductDocumentTree setModal={setModal} refetch={refetch} currentProduct={currentProduct} />
                
            </Card >
        </ >
    );
};

export default ProductDocuments;
