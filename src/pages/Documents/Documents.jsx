import { Button, Card } from "antd";
import useModal from "../../hooks/useModal";
import DocumentModal from "./components/DocumentModal";
import DocumentTree from "./components/DocumentTree";
import { useDocumentList } from "../../QueryServises/documentQuery";
import { useProductContext } from "../../Services/Context/ProductContext";
import { useNavigate } from "react-router-dom";
import DocumentTable from "./components/DocumentTable";



const Documents = () => {
  const navigate = useNavigate()
  const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
  const { data: documentData, refetch } = useDocumentList()
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
