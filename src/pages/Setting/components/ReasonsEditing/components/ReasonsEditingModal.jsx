import { Form, Input } from "antd";
import Modal from "../../../../../components/Modal";

const ReasonsEditingModal = ({
  isOpen,
  modalMode,
  closeModal,
  refetch,
}) => {
  const [form] = Form.useForm();
  const onFinish = () => {
    
  };
  return (
    <>
      <Modal
        isOpen={isOpen}
        title={`${
          modalMode === "edit" ? "ویرایش" : "افزودن"
        } دلایل ویرایش نسخه`}
        size={400}
        onClose={closeModal}
        onSubmit={() => form.submit()}
        mode={modalMode}
      >
        <Form onFinish={onFinish} form={form} layout={"vertical"}>
            <Form.Item name="name" label={"نام"}>
              <Input />
            </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ReasonsEditingModal;
