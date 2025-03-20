import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message, Tree } from "antd";
import React, { useEffect, useState } from "react";
import Modal from "../../../components/Modal";
import { useCreateRole, useUpdateRole } from "../../../QueryServises/roleQuery";
import PermissionsTree from "../../Permission/_components/PermissionListTree";

const RoleModal = ({ isOpen, modalMode, modalData, closeModal, setModal, refetch }) => {
  const [form] = Form.useForm();
  const { isPending: isCreating, mutateAsync: createRole } = useCreateRole();
  const { isPending: isUpdating, mutateAsync: updateRole } = useUpdateRole();
  const [selectedPermissions, setSelectedPermissions] = useState([]);


  useEffect(() => {
    if (modalMode === "edit" && modalData) {
      form.setFieldsValue({
        name: modalData.name,
        permissions: modalData.permissionsIds
      });
    } else if (modalMode === "add") {
      form.resetFields();
    }
  }, [modalMode, modalData, form]);


  const onFinish = (values) => {
    const permissionsIds = selectedPermissions.map((key) => Number(key.replace("permission-", "")))
    const payload = {
      name: values.name,
      permissions: permissionsIds,
    };

    if (modalMode === "add") {
      createRole(payload)
        .then(() => {
          message.success("سمت بادسترسی های انتخاب شده با موفقیت اضافه شد");
          closeModal();
        })
        .catch((error) => {
          message.error("موفقیت آمیز نبود، دوباره امتحان کنید");
          console.error(error);
        });
    } else if (modalMode === "edit") {
      updateRole({ roleId: modalData.id, roleData: payload })
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

  const handlePermissionsChange = (checkedKeys) => {
    setSelectedPermissions(checkedKeys);
  };

  return (
    <div>
      <Button
        className="modal-button"
        icon={<PlusOutlined className="text-center" />}
        onClick={() => setModal({ mode: "add", data: null })}
      >
        <span className="xs:hidden sm:hidden md:inline">افزودن سمت</span>
      </Button>
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
          <Form.Item label="نام سمت :" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="لیست دسترسی ها : " name="permissionsIds">
            <Card
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                maxHeight: "300px",
                overflow: "auto",
                height: "290px",
              }}
            >
              <PermissionsTree onChange={handlePermissionsChange} />
            </Card>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleModal;