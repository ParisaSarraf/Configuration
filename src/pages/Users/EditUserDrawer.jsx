import React, { useEffect } from "react";
import { Drawer, Button, Form, Input, Row, Col, Radio, message } from "antd";
import FileUploader from "../../components/FileUploader/FileUploader";
import { useUpdateUser } from "../../QueryServises/userQuery"; 

const EditUserDrawer = ({ visible, onClose, onSubmit, user }) => {
  const [form] = Form.useForm();
  const { mutate: updateUser, isLoading } = useUpdateUser();
  const [images, setImages] = React.useState({
    signatureImage: [],
    tempImage: [],
  });

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        userName: user.username,
        Name: user.name,
        lastName: user.last_name,
        phoneNumber: user.phone_number,
        nationalCode: user.national_code,
        isStaff: user.is_staff,
        isSuperuser: user.is_superuser,
      });
      setImages({
        signatureImage: user.signature_image ? [user.signature_image] : [],
        tempImage: user.temp_image ? [user.temp_image] : [],
      });
    }
  }, [user, form]);

  const handleImageChange = (type, fileList) => {
    setImages((prev) => ({ ...prev, [type]: fileList }));
  };

  const onFinish = async (values) => {
    const payload = {
      id: user.id,
      username: values.userName,
      password: values.password,
      is_superuser: values.isSuperuser,
      name: values.Name,
      last_name: values.lastName,
      phone_number: values.phoneNumber,
      national_code: values.nationalCode,
      signature_image:
        images.signatureImage.length > 0
          ? images.signatureImage[0].originFileObj
          : null,
      temp_image:
        images.tempImage.length > 0 ? images.tempImage[0].originFileObj : null,
      is_staff: values.isStaff,

    };

    try {
      await updateUser(payload, {
        onSuccess: () => {
          message.success("کاربر با موفقیت ویرایش شد.");
          onSubmit(payload.userData);
          form.resetFields();
          setImages({ signatureImage: [], tempImage: [] });
        },
        onError: () => {
          message.error("مشکلی در ویرایش کاربر به وجود آمده است.");
        },
      });
    } catch (error) {
      console.log(error);
      message.error("مشکلی در ویرایش کاربر به وجود آمده است.");
    }
  };

  return (
    <Drawer
      title="ویرایش کاربر"
      width={500}
      placement="right"
      onClose={onClose}
      open={visible}
      footer={
        <div className="w-full flex flex-row justify-end gap-1">
          <Button onClick={form.submit} type="primary" loading={isLoading}>
            تایید
          </Button>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            لغو
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={16} md={16}>
            <div className="w-full flex flex-row justify-between">
              <Form.Item name="signatureImage" label="امضا">
                <FileUploader
                  value={images.signatureImage}
                  onChange={(fileList) =>
                    handleImageChange("signatureImage", fileList)
                  }
                />
              </Form.Item>
              <Form.Item name="tempImage" label="تصویر کاربر">
                <FileUploader
                  value={images.tempImage}
                  onChange={(fileList) =>
                    handleImageChange("tempImage", fileList)
                  }
                />
              </Form.Item>
            </div>
          </Col>
          <Col xs={24} sm={12} md={12}>
            <Form.Item
              name="userName"
              label="نام کاربری"
              rules={[
                { required: true, message: "لطفا نام کاربری را وارد کنید!" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={12}>
            <Form.Item
              name="Name"
              label="نام"
              rules={[{ required: true, message: "لطفا نام را وارد کنید!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={12}>
            <Form.Item
              name="lastName"
              label="نام خانوادگی"
              rules={[
                { required: true, message: "لطفا نام خانوادگی را وارد کنید!" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={12}>
            <Form.Item
              name="phoneNumber"
              label="شماره تلفن"
              rules={[
                { required: true, message: "لطفا شماره تلفن را وارد کنید!" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={12}>
            <Form.Item
              name="nationalCode"
              label="کد ملی"
              rules={[{ required: true, message: "لطفا کد ملی را وارد کنید!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={12}>
            <Form.Item name="isStaff" label="کارمند">
              <Radio.Group>
                <Radio.Button value={true}>بله</Radio.Button>
                <Radio.Button value={false}>خیر</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={12}>
            <Form.Item name="isSuperuser" label="مدیر">
              <Radio.Group>
                <Radio.Button value={true}>بله</Radio.Button>
                <Radio.Button value={false}>خیر</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
};

export default EditUserDrawer;