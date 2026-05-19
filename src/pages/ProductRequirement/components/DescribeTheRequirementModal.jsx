import { Checkbox, Col, Form, Input, message, Row, TreeSelect } from "antd";
import Modal from "../../../components/Modal";
import FileUploader from "../../../components/FileUploader/FileUploader";
import { useRequirementList } from "../../../QueryServises/requirementQuery";
import {
  useCreatepRroductRequirement,
  useUpdateProductRequirement,
} from "../../../QueryServises/productRequirementQuery";

const DescribeTheRequirementModal = ({
  isOpen,
  modalMode,
  closeModal,
  currentProduct,
  refetch,
}) => {
  const [form] = Form.useForm();
  const { data: requirementList } = useRequirementList();
  const { mutateAsync: createProductRequirement } =
    useCreatepRroductRequirement();
  const { mutateAsync: updateProductRequirement } =
    useUpdateProductRequirement();

  const onFinish = async (values) => {
    const payload = {
      product_id: currentProduct?.id,
      requirement_tree_id: values.requirementType,
      description: values.description,
      state: 10,
      pass_comment: values.pass_comment,
      file: values.file?.[0]?.originFileObj,
      file_description: values.file_description?.[0]?.originFileObj,
      file_2: values.file_2?.[0]?.originFileObj,
      file_3: values.file_3?.[0]?.originFileObj,
      file_4: values.file_4?.[0]?.originFileObj,
      file_5: values.file_5?.[0]?.originFileObj,
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
        await updateProductRequirement({
          productRequirementId: modalData.id,
          ...payload,
        });
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
      const titleFields = ["persian_title"];
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
      <Form form={form} layout="vertical" className="p-4" onFinish={onFinish}>
        <Row gutter={[24]}>
          <Col span={24}>
            <Form.Item
              label="نوع الزام"
              name="requirementType"
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

        <Row gutter={[24]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="توصیف الزام"
              name="pass_comment"
              rules={[
                { required: true, message: "لطفا توصیف الزام را وارد کنید" },
              ]}
            >
              <Input.TextArea rows={1} placeholder="توصیف الزام" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="کد الزام"
              name="code"
              rules={[
                { required: true, message: "لطفا کد الزام را وارد کنید" },
              ]}
            >
              <Input placeholder="مثل: REQ-001" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[24]}>
          <Col span={24}>
            <h4 className="mb-4">فایل‌های پیوست</h4>
            <Row gutter={[16]}>
              {[1, 2, 3, 4, 5].map((num) => (
                <Col xs={24} md={12} key={num}>
                  <Form.Item
                    label={`فایل پیوست ${num > 1 ? num : ""}`}
                    name={`file${num > 1 ? "_" + num : ""}`}
                    extra="حداکثر حجم فایل 10MB"
                  >
                    <FileUploader
                      accept="image/*,.pdf"
                      title={`بارگذاری فایل ${num > 1 ? num : ""}`}
                    />
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        <Row gutter={[24]}>
          <Col span={24}>
            <Form.Item label="توضیحات تکمیلی" name="description">
              <Input.TextArea rows={4} placeholder="هرگونه توضیح اضافی..." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[24]}>
          <Col span={24}>
            <div className="flex flex-wrap gap-4">
              <Form.Item name="preparer" valuePropName="checked">
                <Checkbox>تهیه کننده</Checkbox>
              </Form.Item>
              <Form.Item name="reviewer" valuePropName="checked">
                <Checkbox>بازبین</Checkbox>
              </Form.Item>
              <Form.Item name="approver" valuePropName="checked">
                <Checkbox>تصویب کننده</Checkbox>
              </Form.Item>
            </div>
          </Col>
        </Row>

        <Row gutter={[24]}>
          {["تهیه کننده", "بازبین", "تصویب کننده"].map((title, index) => (
            <Col xs={24} md={8} key={index}>
              <Form.Item label={`امضای ${title}`} name={`signature_${index}`}>
                <FileUploader
                  accept="image/*,.pdf"
                  title={`بارگذاری امضای ${title}`}
                />
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Form>
    </Modal>
  );
};

export default DescribeTheRequirementModal;
