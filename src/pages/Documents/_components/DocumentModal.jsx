import { useEffect } from "react";
import Modal from "../../../components/Modal";
import { Button, Col, Form, Input, message, Row } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  useCreateDocument,
  useUpdateDocument,
} from "../../../QueryServises/documentQuery";

const DocumentModal = ({
  isOpen,
  modalMode,
  modalData,
  closeModal,
  setModal,
}) => {
  const [form] = Form.useForm();
  const { isPending: isCreating, mutateAsync: createDocument } =
    useCreateDocument();
  const { isPending: isUpdating, mutateAsync: updateDocument } =
    useUpdateDocument();

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
    

  const onFinishForm = (values) => {
    const payload = {
      code: values.code,
      persianTitle: values.persianTitle,
      englishTitle: values.englishTitle,
      isUsable: values.isUsable,
      isReproducible: values.isReproducible,
    };

    if (modalMode === "add") {
      createDocument(payload)
        .then(() => {
          message.success("سند با موفقیت اضافه شد");
          closeModal();
        })
        .catch((error) => {
          message.error("موفقیت آمیز نبود، دوباره امتحان کنید");
          console.error(error);
        });
    } else if (modalMode === "edit") {
      updateDocument({ documentId: modalData.id, documentData: payload })
        .then(() => {
          message.success("کاربر با موفقیت ویرایش شد");
          closeModal();
        })
        .catch((error) => {
          message.error("موفقیت آمیز نبود، دوباره امتحان کنید");
          console.error(error);
        });
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
        title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} کاربر`}
        size={600}
        onClose={closeModal}
        onSubmit={() => form.submit()}
        mode={modalMode}
        loading={isCreating || isUpdating}
      >
        <Form
          form={form}
          layout="vertical"
          className="flex flex-col space-y-4"
          onFinish={onFinishForm}
        >
          <Row gutter={[16, 16]}>
            <Col span={4}>
              <Form.Item label="کد" name="code">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="نام فارسی" name="persianTitle">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="نام انگلیسی" name="englishTitle">
                <Input />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="قابل قبول" name="isUsable">
                <Input />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="قابل تولید" name="isReproducible">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default DocumentModal;
