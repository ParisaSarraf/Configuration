import { Card } from "antd";
import useModal from "../../hooks/useModal";
import DocumentModal from "./components/DocumentModal";
import DocumentTree from "./components/DocumentTree";
import { useDocumentList } from "../../QueryServises/documentQuery";
import DocumentTable from "./components/DocumentTable";

const Documents = () => {
  const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
  const { data: documentData, refetch } = useDocumentList()

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
            documentData={documentData}
          />
        }
      >
        <div className="w-full flex flex-row gap-2">
          <div className="w-1/2">
            <DocumentTree setModal={setModal} refetch={refetch} />
          </div>
          <div className="w-3/4 ">
            <DocumentTable refetch={refetch} documentData={documentData} />
          </div>
        </div>
      </Card >
    </ >
  );
};

export default Documents;
