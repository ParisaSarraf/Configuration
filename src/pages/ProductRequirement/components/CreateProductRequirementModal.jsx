import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  TreeSelect,
} from "antd";
import Modal from "../../../components/Modal";
import { useRequirementList } from "../../../QueryServises/requirementQuery";
import {
  useCreateProductRequirement,
  useUpdateProductRequirement,
} from "../../../QueryServises/productRequirementQuery";

const CreateProductRequirementModal = ({
  isOpen,
  closeModal,
  refetch,
  modalMode,
  modalData,
  currentProduct,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
  const {
    data: requirementList,
    isFetching: requirementsFetching,
    isError: requirementsError,
    refetch: refetchRequirements,
  } = useRequirementList({ placeholderData: undefined });
  const { mutateAsync: createProductRequirement } =
    useCreateProductRequirement();
  const { mutateAsync: updateProductRequirement } =
    useUpdateProductRequirement();

  const requirement = modalData?.requirement ?? modalData;

  useEffect(() => {
    if (!isOpen) return;
    if (modalMode === "edit" && requirement) {
      form.setFieldsValue({
        title: requirement.title ?? "",
        code: requirement.code ?? "",
        requirementId:
          requirement.requirement_tree_id ??
          requirement.requirement_tree?.id ??
          requirement.requirement?.id ??
          requirement.requirement_id ??
          undefined,
      });
    } else {
      form.resetFields();
    }
  }, [isOpen, modalMode, requirement, form]);

  const onFinish = async (values) => {
    if (submitLock.current) return;
    submitLock.current = true;
    setSubmitting(true);
    const payload = {
      product_id: currentProduct?.id,
      requirement_tree_id: values.requirementId,
      title: values.title,
      code: values.code,
    };
    try {
      if (modalMode === "add") {
        await createProductRequirement(payload);
        message.success("الزام با موفقیت اضافه شد");
      } else {
        const formData = new FormData();
        formData.append("product_id", String(payload.product_id));
        formData.append(
          "requirement_tree_id",
          String(payload.requirement_tree_id),
        );
        formData.append("title", payload.title);
        await updateProductRequirement({
          productRequirementId: requirement.id,
          formData,
        });
        message.success("الزام محصول ویرایش شد");
      }

      await refetch();
      closeModal();
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "موفقیت آمیز نبود، دوباره امتحان کنید";
      message.error(errorMessage);
    } finally {
      submitLock.current = false;
      setSubmitting(false);
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
      size={600}
      onClose={() => {
        if (!submitLock.current) closeModal();
      }}
      onSubmit={() => {
        if (!submitLock.current) form.submit();
      }}
      loading={submitting}
      closable={!submitting}
      maskClosable={!submitting}
      keyboard={!submitting}
      mode={modalMode}
      // className="scroll-modal"
      destroyOnClose
    >
      {requirementsError && !requirementList && (
        <Alert
          type="error"
          showIcon
          message="دریافت انواع الزام ناموفق بود"
          action={
            <Button onClick={() => refetchRequirements()}>تلاش دوباره</Button>
          }
        />
      )}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={24}>
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
              label="کد الزام"
              name="code"
              rules={[
                { required: true, message: "لطفا کد الزام را انتخاب کنید" },
              ]}
            >
              <Input placeholder="کد الزام محصول" />
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
                loading={requirementsFetching}
                disabled={requirementsFetching && !requirementList}
                treeData={getTreeSelectOptions(
                  requirementList || [],
                  modalMode,
                  modalData,
                )}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateProductRequirementModal;
