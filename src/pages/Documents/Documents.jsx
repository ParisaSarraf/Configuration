import { Card } from "antd";
import useModal from "../../hooks/useModal";
import DocumentModal from "./components/DocumentModal";
import DocumentTree from "./components/DocumentTree";
import { useDocumentList } from "../../QueryServises/documentQuery";
import DocumentTable from "./components/DocumentTable";
// import DataExporter from "../../components/DataExporter/DataExporter";
// import {DocumentCol} from "./components/DocumentCol";

const Documents = () => {
  const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
  const { data: documentData, refetch } = useDocumentList();

  // const flattenData = (data) => {
  //     if (!data) return [];
  //     let flat = [];
  //     data.forEach(item => {
  //         const {children, ...rest} = item;
  //         flat.push(rest);
  //         if (children && children.length > 0) {
  //             flat = flat.concat(flattenData(children));
  //         }
  //     });
  //     return flat;
  // };

  // const flattenedDocumentData = flattenData(documentData);

  return (
    <>
      <Card
        title="اسناد"
        extra={
          <div className="flex gap-4">
            {/*<DataExporter*/}
            {/*    excelData={documentData}*/}
            {/*    pdfColumns={DocumentCol}*/}
            {/*    pdfData={flattenedDocumentData}*/}
            {/*    fileName="لیست_اسناد"*/}
            {/*/>*/}
            <DocumentModal
              isOpen={isOpen}
              modalMode={modalMode}
              modalData={modalData}
              closeModal={closeModal}
              setModal={setModal}
              refetch={refetch}
              documentData={documentData}
            />
          </div>
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
      </Card>
    </>
  );
};

export default Documents;
