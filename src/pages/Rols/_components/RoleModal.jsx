import { Form, Input, message } from "antd";
import { useEffect } from "react";
import Modal from "../../../components/Modal";
import { useCreateRole, usePatchRole } from "../../../QueryServises/roleQuery";

const RoleModal = ({ isOpen, modalMode, modalData, closeModal, refetch }) => {
  const [form] = Form.useForm();
  const { isPending: isCreating, mutateAsync: createRole } = useCreateRole();
  const { isPending: isUpdating, mutateAsync: updateRole } = usePatchRole();

  useEffect(() => {
    if (modalMode === "edit" && modalData) {
      form.setFieldsValue({
        name: modalData.name,
      });
    } else if (modalMode === "add") {
      form.resetFields();
    }
  }, [modalMode, modalData, form]);

  const onFinish = async (values) => {
    if (modalMode === "add") {
      try {
        await createRole({ name: values.name });
        message.success("سمت با موفقیت اضافه شد");
        closeModal();
        refetch();
      } catch (error) {
        message.error("خطا در افزودن سمت");
        console.error(error);
      }
    } else if (modalMode === "edit") {
      try {
        await updateRole({
          roleId: modalData.id,
          name: values.name
        })
        message.success("سمت  با موفقیت ویرایش شد.");
        closeModal();
        refetch();
      } catch (error) {
        console.error("Update error:", error);
        message.error(error.message || "مشکلی در ویرایش پیش آمده است.");
      }
    }
  };


  return (
    <div>
      <Modal
        isOpen={isOpen}
        title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} سمت`}
        size={600}
        onClose={closeModal}
        onSubmit={() => form.submit()}
        mode={modalMode}
        loading={isCreating || isUpdating}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item label="نام سمت :" name="name" rules={[{ required: true, message: "این فیلد الزامی است" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleModal;