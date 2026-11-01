import { Button, Card, Descriptions, Empty, message, Modal, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import useModal from "../../../hooks/useModal";
import DescribeTheRequirementModal from "./DescribeTheRequirementModal";
import AcknowledgmentOfRequirement from "./AcknowledgmentOfRequirement";
import RequirementTreeView from "./RequirementTreeView";
import { getRequirementState } from "../utils/requirementTree";
import {
  useDeleteProductRequirement,
  useProductRequirementList,
} from "../../../QueryServises/productRequirementQuery";
import CreateProductRequirementModal from "./CreateProductRequirementModal";

const showValue = (value) =>
  value == null || value === "" ? "—" : String(value);

export default function ProductRequirementTree({
  currentProduct,
  setSelectedProductRequirement,
}) {
  const { isOpen, modalMode, modalData, modalType, setModal, closeModal } =
    useModal();
  const { data, isLoading, isError, refetch } = useProductRequirementList(
    currentProduct?.id,
  );
  const { mutateAsync: deleteRequirement } = useDeleteProductRequirement();
  const [detail, setDetail] = useState(null);
  const addRequirement = (category = null) =>
    setModal({
      mode: "add",
      data: category,
      type: "CreateProductRequirementModal",
    });

  const handleDelete = (requirement) => {
    if (requirement?.id == null) return;
    Modal.confirm({
      title: "حذف الزام محصول",
      content: `الزام «${requirement.title || requirement.id}» حذف شود؟`,
      okText: "حذف الزام",
      cancelText: "انصراف",
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await deleteRequirement(requirement.id);
          setSelectedProductRequirement(null);
          message.success("الزام محصول حذف شد");
          await refetch();
        } catch (error) {
          message.error(
            error?.response?.data?.detail ||
              error?.message ||
              "حذف الزام ناموفق بود",
          );
          throw error;
        }
      },
    });
  };
  const edition = detail?.edition;
  const state = getRequirementState(edition?.state);

  return (
    <Card
      title="پنجره الزامات"
      extra={
        <Button
          icon={<PlusOutlined />}
          aria-label="افزودن الزام"
          disabled={!currentProduct?.id}
          onClick={() => addRequirement()}
          className="modal-button"
        />
      }
    >
      {!currentProduct?.id ? (
        <Empty description="ابتدا یک محصول انتخاب کنید" />
      ) : (
        <RequirementTreeView
          data={data}
          productId={currentProduct.id}
          isLoading={isLoading}
          isError={isError}
          onDelete={handleDelete}
          onSelectRequirement={setSelectedProductRequirement}
          onShowEdition={setDetail}
          onAcknowledge={(requirement) =>
            setModal({
              mode: "add",
              data: { product_requirements: requirement },
              type: "AcknowledgmentOfRequirement",
            })
          }
        />
      )}
      {isOpen && modalType === "CreateProductRequirementModal" && (
        <CreateProductRequirementModal
          isOpen
          modalMode={modalMode}
          modalData={modalData}
          currentProduct={currentProduct}
          closeModal={closeModal}
          refetch={refetch}
        />
      )}
      {isOpen && modalType === "DescribeTheRequirementModal" && (
        <DescribeTheRequirementModal
          isOpen
          modalMode={modalMode}
          modalData={modalData}
          currentProduct={currentProduct}
          closeModal={closeModal}
          refetch={refetch}
        />
      )}
      {isOpen && modalType === "AcknowledgmentOfRequirement" && (
        <AcknowledgmentOfRequirement
          isOpen
          modalMode={modalMode}
          modalData={modalData}
          closeModal={closeModal}
          refetch={refetch}
        />
      )}
      <Modal
        open={!!detail}
        title="جزئیات نسخه الزام"
        footer={null}
        onCancel={() => setDetail(null)}
        width={720}
      >
        <Descriptions
          style={{ overflowWrap: "anywhere" }}
          bordered
          column={1}
          size="small"
        >
          <Descriptions.Item label="عنوان الزام">
            {detail?.requirement?.title}
          </Descriptions.Item>
          <Descriptions.Item label="کد کامل">
            <bdi dir="ltr">{showValue(edition?.full_code)}</bdi>
          </Descriptions.Item>
          <Descriptions.Item label="کد نسخه">
            <bdi dir="ltr">{showValue(edition?.code)}</bdi>
          </Descriptions.Item>
          <Descriptions.Item label="وضعیت">
            <Tag color={state.color}>{state.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="توضیحات">
            {showValue(edition?.description)}
          </Descriptions.Item>
          <Descriptions.Item label="توصیف / نظر پذیرش">
            {showValue(edition?.pass_comment)}
          </Descriptions.Item>
          <Descriptions.Item label="توضیح فایل">
            {showValue(edition?.file_description)}
          </Descriptions.Item>
          <Descriptions.Item label="فایل">
            {edition?.file ? "فایل پیوست دارد" : "بدون پیوست"}
          </Descriptions.Item>
          <Descriptions.Item label="محصولات تخصیص‌یافته">
            {edition?.assigned_to?.length
              ? edition.assigned_to.map((assignment) => (
                  <div key={assignment.id}>
                    محصول {assignment.to_product_id}{" "}
                    {assignment.is_current_product && "(محصول جاری)"}
                    {" — "}
                    {getRequirementState(assignment.state).label}
                    {assignment.pass_comment && ` — ${assignment.pass_comment}`}
                  </div>
                ))
              : "هنوز تخصیص داده نشده است"}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </Card>
  );
}
