import { Card } from "antd";
import useModal from "../../hooks/useModal";
import DocumentModal from "./components/DocumentModal";
import DocumentTree from "./components/DocumentTree";
import { useDocumentList } from "../../QueryServises/documentQuery";



const Documents = () => {
  const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
  const { refetch } = useDocumentList()

  return (
    <>
      <Card
        title="اسناد"
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
