import { Card } from "antd";
import useModal from "../../hooks/useModal";
import DocumentModal from "./components/DocumentModal";
import DocumentTree from "./components/DocumentTree";
import { useDocumentList } from "../../QueryServises/documentQuery";
import { useProductContext } from "../../Services/ProductContext";



const Documents = () => {
  const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
  const { refetch } = useDocumentList()
  const { currentProduct } = useProductContext();


  return (
    <>
      <Card
        title={` اسناد ${currentProduct?.name || ''}`}
        extra={
          <DocumentModal
            isOpen={isOpen}
            modalMode={modalMode}
            modalData={modalData}
            closeModal={closeModal}
            setModal={setModal}
            refetch={refetch}
          />
        }
      >
        <DocumentTree setModal={setModal} refetch={refetch} />
      </Card >
    </ >
  );
};

export default Documents;
