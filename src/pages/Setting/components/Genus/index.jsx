import { Button, Card, Spin, Table } from "antd";
import useModal from "../../../../hooks/useModal";
import GenusModal from "./components/GenusModal";
import {
  useDeleteGenusProduct,
  useGenusProductList,
} from "@/QueryServises/genusQuery/index.js";
import GenusTable from "./components/GenusTable";
import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import StandardCodeGenusModal from "./components/StandardCodeGenusModal";

const Genus = () => {
  const { isOpen, modalMode, modalData, setModal, closeModal, modalType } = useModal();
  const { data, isFetching, refetch } = useGenusProductList();
  const { isPending: isDeleting } = useDeleteGenusProduct();

  const [selectedGenusLabel, setSelectedGenusLabel] = useState("");
  const [genusId, setGenusId] = useState(null);

  return (
    <Spin spinning={isFetching && !data} tip="در حال دریافت اطلاعات...">
      <div className="w-full grid grid-cols-2 gap-2">
        <Card
          title="مدیریت ماده اولیه"
          extra={
            <GenusModal
              isOpen={isOpen}
              modalMode={modalMode}
              modalData={modalData}
              closeModal={closeModal}
              setModal={setModal}
              refetch={refetch}
            />
          }
          loading={isDeleting}
        >
          <GenusTable
            setModal={setModal}
            setGenusId={setGenusId}
            setSelectedGenusLabel={setSelectedGenusLabel}
          />
        </Card>
        <Card
          className="w-full"
          title={`کد های استاندارد ماده اولیه - ${selectedGenusLabel}`}
          extra={
            <Button
              className="modal-button"
              icon={<PlusOutlined className="text-center" />}
              onClick={() =>
                setModal({
                  mode: "add",
                  data: null,
                  type: "addStandardCodeGenus",
                })
              }
            />
          }
        >
          <Table
            // columns={StandardCodeCol({ handleDelete, handleEdit })}
            // dataSource={TableData || []}
            rowKey="id"
            bordered
            locale={{ emptyText: "هیچ کد استانداردی برای این هویت وجود ندارد" }}
            size="small"
            pagination={{
              defaultPageSize: 5,
              pageSizeOptions: [10, 20, 45, 100],
              size: "small",
              showSizeChanger: true,
            }}
          />
        </Card>

        <StandardCodeGenusModal
          genusId={genusId}
          selectedGenusLabel={selectedGenusLabel}
          isOpen={modalType === "addStandardCodeGenus" && isOpen}
          modalMode={modalMode}
          modalData={modalData}
          closeModal={closeModal}
          setModal={setModal}
          // standardRefetch={standardRefetch}
          modalType={modalType}
        />
      </div>
    </Spin>
  );
};

export default Genus;
