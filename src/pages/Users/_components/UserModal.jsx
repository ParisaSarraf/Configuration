import React, { useEffect } from "react";
import Modal from "../../../components/Modal";
import { Button, Col, Form, Input, message, Radio, Row } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import FileUploader from "../../../components/FileUploader/FileUploader";
import { useCreateUser, useUpdateUser } from "../../../QueryServises/userQuery";
import { BASEURL } from "../../../utils/Api";

const UserModal = ({ isOpen, modalMode, modalData, closeModal, setModal, refetch }) => {
  const [form] = Form.useForm();
  const BaseUrl = BASEURL;
  const { isPending: isCreating, mutateAsync: createUser } = useCreateUser();
  const { isPending: isUpdating, mutateAsync: updateUser } = useUpdateUser();

  useEffect(() => {
    if (modalMode === "edit" && modalData) {
      form.setFieldsValue({
        userName: modalData.username,
        name: modalData.name,
        lastName: modalData.last_name,
        PhoneNumber: modalData.phone_number,
        nationalCode: modalData.national_code,
        isStaff: modalData.is_staff,
        isSuperuser: modalData.is_superuser,
        signatureImage: modalData.signature_image
          ? [
            {
              uid: "-1",
              name: "signature_image",
              url: BaseUrl.replace("/api/v1", "") + modalData.signature_image,
            },
          ]
          : [],
        tempImage: modalData.temp_image
          ? [
            {
              uid: "-2",
              name: "temp_image",
              url: BaseUrl.replace("/api/v1", "") + modalData.temp_image,
            },
          ]
          : [],
      });
    } else if (modalMode === "add") {
      form.resetFields();
    }
  }, [modalMode, modalData, form]);

  const onFinishForm = (values) => {
    const payload = {
      username: values.userName,
      password: values.password,
      is_superuser: false,
      name: values.name,
      last_name: values.lastName,
      phone_number: values.PhoneNumber,
      national_code: values.nationalCode,
      signature_image:
        values.signatureImage && values.signatureImage.length > 0
          ? values.signatureImage[0].originFileObj
          : null,
      temp_image:
        values.tempImage && values.tempImage.length > 0
          ? values.tempImage[0].originFileObj
          : null,
      is_staff: false,
    };

    if (modalMode === "add") {
      createUser(payload)
        .then(() => {
          message.success("کاربر با موفقیت اضافه شد");
          closeModal();
          refetch()
        })
        .catch((error) => {
          message.error("موفقیت آمیز نبود، دوباره امتحان کنید");
          console.error(error);
        });
    } else if (modalMode === "edit") {
      updateUser({ userId: modalData.id, userData: payload })
        .then(() => {
          message.success("کاربر با موفقیت ویرایش شد");
          closeModal();
          refetch()
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
        <span className="xs:hidden sm:hidden md:inline">افزودن کاربر</span>
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
            <Col span={12}>
              <Form.Item name="signatureImage" label="امضا کاربر">
                <FileUploader />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tempImage" label="تصویر کاربر">
                <FileUploader />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="userName"
                label="نام کاربری"
                rules={[
                  { required: true, message: "لطفاً نام کاربری را وارد کنید" },
                  { min: 3, message: "نام کاربری باید حداقل 3 کاراکتر باشد" }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            {modalMode !== "edit" && (
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="رمزعبور"
                  rules={[
                    { required: modalMode === "add", message: "لطفاً رمز عبور را وارد کنید" },
                    { min: 6, message: "رمز عبور باید حداقل 6 کاراکتر باشد" }
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              </Col>
            )}
            <Col span={12}>
              <Form.Item name="name" label="نام">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="نام خانوادگی">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="PhoneNumber" label="شماره تلفن">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nationalCode"
                label="کدملی"
                rules={[
                  { required: true, message: "لطفاً کد ملی را وارد کنید" },
                  { pattern: /^\d{10}$/, message: "کد ملی باید 10 رقم باشد" }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            {/* <Col span={12}>
              <Form.Item name="isStaff" label="مدیر">
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value={true}>بله</Radio.Button>
                  <Radio.Button value={false}>خیر</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isSuperuser" label="ادمین">
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value={true}>بله</Radio.Button>
                  <Radio.Button value={false}>خیر</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col> */}
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default UserModal;