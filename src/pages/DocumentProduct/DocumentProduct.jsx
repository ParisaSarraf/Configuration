import { Card } from "antd";
import useModal from "../../hooks/useModal";
import { useDocumentList } from "../../QueryServises/documentQuery";
import { useProductContext } from "../../Services/Context/ProductContext";
import DocumentProductModal from "./components/DocumentProductModal";



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
                        isOpen={isOpen}
                        modalMode={modalMode}
                        modalData={modalData}
                        closeModal={closeModal}
                        setModal={setModal}
                        refetch={refetch}
                    />
                }
            >
                {/* <DocumentTree setModal={setModal} refetch={refetch} /> */}
            </Card >
        </ >
    );
};

export default ProductDocuments;
