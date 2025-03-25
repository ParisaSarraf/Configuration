import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message } from "antd";
import React, { useEffect, useState } from "react";
import Modal from "../../../components/Modal";
import { useCreateRole, usePatchRole } from "../../../QueryServises/roleQuery";
import PermissionsTree from "../../Permission/_components/PermissionListTree";
import { useCreateRolePermission, usePutRolePermission } from "../../../QueryServises/role&permission";

const RoleModal = ({ isOpen, modalMode, modalData, closeModal, setModal, refetch }) => {
  const [form] = Form.useForm();
  const { isPending: isCreating, mutateAsync: createRole } = useCreateRole();
  const { isPending: isUpdating, mutateAsync: updateRole } = usePatchRole();
  const { isPending: isCreat, mutateAsync: createRolePermissions } = useCreateRolePermission();
  const { isPending: isUpdate, mutateAsync: updateRolePermissions } = usePutRolePermission();
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [initialCheckedKeys, setInitialCheckedKeys] = useState([]);

  useEffect(() => {
    if (modalMode === "edit" && modalData) {
      form.setFieldsValue({
        name: modalData.name,
      });
      const permissionsKeys = modalData.permissions.map((permission) => `permission-${permission.id}`);
      setInitialCheckedKeys(permissionsKeys);
      setSelectedPermissions(permissionsKeys);
    } else if (modalMode === "add") {
      form.resetFields();
      setInitialCheckedKeys([]);
      setSelectedPermissions([]);
    }
  }, [modalMode, modalData, form]);

  const onFinish = async (values) => {
    const permissionsIds = selectedPermissions.map((key) =>
      Number(key.replace("permission-", ""))
    );

    if (modalMode === "add") {
      try {
        const createdRole = await createRole({ name: values.name });
        await createRolePermissions({
          roles_ids: [createdRole.id],
          permissions_ids: permissionsIds
        });
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
        });
        await updateRolePermissions({
          roleId: modalData.id,
          permission_ids: permissionsIds
        });
        message.success("سمت و دسترسی های آن با موفقیت ویرایش شد.");
        closeModal();
        refetch();
      } catch (error) {
        console.error("Update error:", error);
        message.error(error.message || "مشکلی در ویرایش پیش آمده است.");
      }
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
        loading={isCreating || isUpdating || isCreat}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item label="نام سمت :" name="name" rules={[{ required: true, message: "این فیلد الزامی است" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="لیست دسترسی ها : ">
            <Card
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                maxHeight: "300px",
                overflow: "auto",
                height: "290px",
              }}
            >
              <PermissionsTree
                onChange={handlePermissionsChange}
                checkedKeys={selectedPermissions}
                initialCheckedKeys={initialCheckedKeys}
              />
            </Card>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleModal;