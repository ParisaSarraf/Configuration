import { Button, Card, Input, message, Modal, Spin, Table } from "antd";
import useModal from "../../../../hooks/useModal";
import GenusModal from "./components/Genus/GenusModal";
import {
  useDeleteGenusProduct,
  useGenusProductList,
} from "@/QueryServises/genusQuery/index.js";
import GenusTable from "./components/GenusTreeTable";
import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import StandardCodeGenusModal from "./components/GenusStandardCode/StandardCodeGenusModal";
import { useStandardCodeGenusById } from "../../../../QueryServises/genusQuery";
import { GenusStandardCol } from "./components/GenusStandardCode/GenusStandardCol";
import { useDeleteStandardCode } from "../../../../QueryServises/StandardCodeQuery";

const { Search } = Input;

const Genus = () => {
  const { isOpen, modalMode, modalData, setModal, closeModal, modalType } =
    useModal();
  const { data, isFetching, refetch } = useGenusProductList();
  const { isPending: isDeleting } = useDeleteGenusProduct();

  const [selectedGenusLabel, setSelectedGenusLabel] = useState("");
  const [genusId, setGenusId] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [searchDescription, setSearchDescription] = useState("");
  const { mutateAsync: deleteStandardCode } = useDeleteStandardCode();

  const { data: StandardGenusCodeList, refetch: standardRefetch } =
    useStandardCodeGenusById(genusId, searchName, searchDescription);

  const TableData = Array.isArray(StandardGenusCodeList)
    ? StandardGenusCodeList.flatMap((genus) =>
        Array.isArray(genus.genus_codes)
          ? genus.genus_codes.map((item) => ({
              ...item,
              parentData: genus,
            }))
          : [],
      )
    : [];

  const handleDelete = (id) => {
    Modal.confirm({
      title: "حذف کد استاندارد",
      content: "آیا از حذف این کد استاندارد مطمئن هستید؟",
      okText: "بله",
      cancelText: "خیر",
      okType: "danger",
      async onOk() {
        try {
          await deleteStandardCode(id);
          message.success("کد استاندارد با موفقیت حذف شد");
          await standardRefetch();
          await refetch();
          closeModal();
        } catch (error) {
          message.error("حذف کد استاندارد با خطا مواجه شد");
          console.error("Delete error:", error);
        }
      },
    });
  };

  const handleEdit = (record) => {
    setModal({
      mode: "edit",
      data: record,
      type: "addStandardCodeGenus",
    });
  };

  const handleNameSearch = (value) => {
    setSearchName(value);
  };

  const handleDescriptionSearch = (value) => {
    setSearchDescription(value);
  };

  return (
    <Spin spinning={isFetching && !data} tip="در حال دریافت اطلاعات...">
      <div className="w-full grid grid-cols-2 gap-2">
        <Card
          title="مدیریت ماده اولیه"
          extra={
            <Button
              className="modal-button"
              icon={<PlusOutlined className="text-center" />}
              onClick={() =>
                setModal({ mode: "add", data: null, type: "GenusModalType" })
              }
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
          <div className="flex flex-row gap-2 mb-1">
            <Search
              placeholder="کد های استاندارد"
              onSearch={handleNameSearch}
              enterButton
              style={{ flex: 1 }}
            />
            <Search
              placeholder="نام"
              onSearch={handleDescriptionSearch}
              enterButton
              style={{ flex: 1 }}
            />
          </div>
          <Table
            columns={GenusStandardCol({ handleDelete, handleEdit })}
            dataSource={TableData || []}
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
          standardRefetch={standardRefetch}
          modalType={modalType}
        />

        <GenusModal
          isOpen={modalType === "GenusModalType" && isOpen}
          modalMode={modalMode}
          modalData={modalData}
          standardRefetch={standardRefetch}
          closeModal={closeModal}
          setModal={setModal}
          modalType={modalType}
          refetch={refetch}
        />
      </div>
    </Spin>
  );
};

export default Genus;
