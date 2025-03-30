import { useEffect } from "react";
import Modal from "../../../components/Modal";
import { Button, Col, Form, Input, message, Row, Switch } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  useCreateDocument,
  useUpdateDocument,
  useDocumentList,
} from "../../../QueryServises/documentQuery";

const DocumentModal = ({ isOpen, modalMode, modalData, closeModal, setModal }) => {
  const [form] = Form.useForm();
  const { isPending: isCreating, mutateAsync: createDocument } = useCreateDocument();
  const { isPending: isUpdating, mutateAsync: updateDocument } = useUpdateDocument();
  const { refetch } = useDocumentList();

  useEffect(() => {
    if (modalMode === "edit" && modalData) {
      form.setFieldsValue({
        code: modalData.code,
        persianTitle: modalData.persianTitle,
        englishTitle: modalData.englishTitle,
        isUsable: modalData.isUsable,
        isReproducible: modalData.isReproducible,
      });
    } else if (modalMode === "add") {
      form.resetFields();
    }
  }, [modalMode, modalData, form]);

  const onFinishForm = async (values) => {
    const payload = {
      code: values.code,
      persianTitle: values.persianTitle,
      englishTitle: values.englishTitle,
      isUsable: values.isUsable,
      isReproducible: values.isReproducible,
    };

    try {
      if (modalMode === "add") {
        await createDocument(payload);
        message.success("سند با موفقیت اضافه شد");
      } else {
        await updateDocument({ documentId: modalData.id, ...payload });
        message.success("سند با موفقیت ویرایش شد");
      }
      await refetch();
      closeModal();
    } catch (error) {
      message.error("موفقیت آمیز نبود، دوباره امتحان کنید");
      console.error("Error details:", error.response?.data);
    }
  };

  return (
    <>
      <Button
        className="modal-button"
        icon={<PlusOutlined className="text-center" />}
        onClick={() => setModal({ mode: "add", data: null })}
      >
        <span className="xs:hidden sm:hidden md:inline">افزودن سند</span>
      </Button>
      <Modal
        isOpen={isOpen}
        title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} سند`}
        size={700}
        onClose={closeModal}
        onSubmit={() => form.submit()}
        mode={modalMode}
        loading={isCreating || isUpdating}
      >
        <Form form={form} layout="vertical" className="p-4" onFinish={onFinishForm}>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item
                label="کد"
                name="code"
                rules={[{ required: true, message: "لطفاً کد را وارد کنید" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label="نام فارسی"
                name="persianTitle"
                rules={[{ required: true, message: "لطفاً نام فارسی را وارد کنید" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label="نام انگلیسی"
                name="englishTitle"
                rules={[{ required: true, message: "لطفاً نام انگلیسی را وارد کنید" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item label="قابل قبول" name="isUsable" valuePropName="checked">
                <Switch checkedChildren="بله" unCheckedChildren="خیر" className="bg-gray-300" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item label="قابل تولید" name="isReproducible" valuePropName="checked">
                <Switch checkedChildren="بله" unCheckedChildren="خیر" className="bg-gray-300" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default DocumentModal;
