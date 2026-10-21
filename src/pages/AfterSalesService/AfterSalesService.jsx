import { useState } from "react";
import { useProductContext } from "../../Services/Context/ProductContext";
import {
  useDeleteExperience,
  useGetProductExperienceFilterById,
} from "../../QueryServises/experienceQuery";
import { useAccessOfUserByIdList } from "../../QueryServises/accsessQuery";
import { Card, message, Modal, Table } from "antd";
import useModal from "../../hooks/useModal";
import ExperienceModal from "../Experience/components/ExperienceModal";
import ExperienceCol from "../Experience/components/ExperienceCol";
import ExperienceDetailViewModal from "../Experience/components/ExperienceDetailViewModal";
import AfterSalesServiceModal from "./components/AfterSalesServiceModal";
import AfterSalesServiceCol from "./components/AfterSalesServiceCol";
import AfterSalesServiceDetailViewModal from "./components/AfterSalesServiceDetailViewModal";

const AfterSalesService = () => {
  const { isOpen, modalMode, modalData, modalType, setModal, closeModal } =
    useModal();
  const { currentProduct } = useProductContext();
  const [filter, setFilter] = useState({});
  const { data = [], refetch } = useGetProductExperienceFilterById(
    currentProduct?.id,
    filter,
  );
  const { mutateAsync: deleteExperience } = useDeleteExperience();
  const { data: userData = [] } = useAccessOfUserByIdList();

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "آیا مطمئن هستید که می‌خواهید این تجربه را حذف کنید؟",
      content: "این عمل قابل بازگشت نیست.",
      okText: "حذف",
      okType: "danger",
      cancelText: "لغو",
      onOk: async () => {
        try {
          await deleteExperience(id);
          message.success("تجربه با موفقیت حذف شد");
          refetch();
        } catch (error) {
          console.error("error delete", error);
          message.error("خطا در حذف تجربه");
        }
      },
    });
  };

  const handleEdit = (record) => {
    setModal({
      mode: "edit",
      data: record,
      type: "addOrEdit",
    });
  };

  const handleShowDetail = (record) => {
    setModal({ mode: "view", data: record, type: "detailExperience" });
  };

  return (
    <Card
      title={` خدمات پس از فروش ${currentProduct?.name || ""}`}
      extra={
        <>
          <AfterSalesServiceModal
            currentProduct={currentProduct}
            isOpen={modalType === "addOrEdit" && isOpen}
            modalMode={modalMode}
            modalData={modalData}
            modalType={modalType}
            closeModal={closeModal}
            setModal={setModal}
            refetch={refetch}
          />
        </>
      }
    >
      <Table
        columns={AfterSalesServiceCol({
          handleDelete,
          handleEdit,
          handleShowDetail,
          userData,
          setFilter,
        })}
        dataSource={data}
        locale={{ emptyText: "هیچ داده ای وجود ندارد" }}
        size="small"
        pagination={{
          defaultPageSize: 5,
          pageSizeOptions: [10, 20, 45, 100],
          size: "small",
          showSizeChanger: true,
        }}
      />

      <AfterSalesServiceDetailViewModal
        isOpen={modalType === "detailExperience" && isOpen}
        modalMode={modalMode}
        modalType={modalType}
        modalData={modalData}
        closeModal={closeModal}
      />
    </Card>
  );
};

export default AfterSalesService;
