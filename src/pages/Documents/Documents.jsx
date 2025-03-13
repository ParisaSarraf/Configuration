import useModal from "../../hooks/useModal";
import DocumentModal from "./_components/documentModal";
import DocumentTree from "./_components/DocumentTree";

const Documents = () => {
  const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();

  return (
    <div className="flex flex-row gap-4">
      <div className="card">
        <DocumentModal
          isOpen={isOpen}
          modalMode={modalMode}
          modalData={modalData}
          closeModal={closeModal}
          setModal={setModal}
        />
        <DocumentTree />
      </div>
      <div className="card">سلام</div>
    </div>
  );
};

export default Documents;
