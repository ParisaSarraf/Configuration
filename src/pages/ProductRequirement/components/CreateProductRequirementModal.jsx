import { Col, Form, Input, message, Row, TreeSelect } from "antd";
import Modal from "../../../components/Modal";
import { useRequirementList } from "../../../QueryServises/requirementQuery";
import { useCreateProductRequirement } from "../../../QueryServises/productRequirementQuery";

const CreateProductRequirementModal = ({
  isOpen,
  closeModal,
  refetch,
  modalMode,
  modalData,
  currentProduct
}) => {
  const [form] = Form.useForm();
  const { data: requirementList } = useRequirementList();
  const { mutateAsync: createProductRequirement } = useCreateProductRequirement();

  const onFinish = async (values) => {
    const payload = {
      product_id: currentProduct?.id,
      requirement_tree_id: values.requirementId,
      title: values.title,
    };
    try {
      if (modalMode === "add") {
        await createProductRequirement(payload);
        message.success("الزام با موفقیت اضافه شد");
        await refetch();
      } else {
        if (!modalData?.id) {
          throw new Error("Missing product requirement ID for edit");
        }
        // await updateProductRequirement({
        //   productRequirementId: modalData.id,
        //   ...payload,
        // });
        message.success("الزام با موفقیت ویرایش شد");
        await refetch();
      }

      closeModal();
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "موفقیت آمیز نبود، دوباره امتحان کنید";
      message.error(errorMessage);
    }
  };

  const getTreeSelectOptions = (data, modalMode = null, modalData = null) => {
    return data.map((item) => {
      const titleFields = ["title", "persian_title", "english_title"];
      let title = "بدون عنوان";
      for (const field of titleFields) {
        if (item[field]) {
          title = item[field];
          if (field !== "code" && item.code) {
            title = ` ${title}`;
          }
          break;
        }
      }
      return {
        title: title,
        value: item.id,
        children: item.children
          ? getTreeSelectOptions(item.children, modalMode, modalData)
          : [],
      };
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`${modalMode === "edit" ? "ویرایش" : "توصیف"} الزام`}
      size={700}
      onClose={closeModal}
      onSubmit={() => form.submit()}
      mode={modalMode}
      className="scroll-modal"
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="الزام"
              name="title"
              rules={[
                { required: true, message: "لطفا نوع الزام را انتخاب کنید" },
              ]}
            >
              <Input placeholder="نام الزام محصول" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="نوع الزام"
              name="requirementId"
              rules={[
                { required: true, message: "لطفا نوع الزام را انتخاب کنید" },
              ]}
            >
              <TreeSelect
                treeData={getTreeSelectOptions(requirementList || [])}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateProductRequirementModal;
