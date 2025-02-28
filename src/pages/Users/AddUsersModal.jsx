import React, { useState } from "react";
import { Modal, Button, Form, Input, Row, Col, Radio, message } from "antd";
import FileUploader from "../../components/FileUploader/FileUploader";
import UserQuery from "../../QueryServises/UsersQuery";

const AddUsersModal = ({ visible, onClose, onSubmit }) => {
    const [form] = Form.useForm();
    const { createUser } = UserQuery();
    const [images, setImages] = useState({
        signatureImage: [],
        tempImage: [],
    });

    const handleImageChange = (type, fileList) => {
        setImages((prev) => ({ ...prev, [type]: fileList }));
    };

    const onFinish = async (values) => {
        const payload = {
            username: values.userName,
            password: values.password,
            is_superuser: values.isSuperuser,
            name: values.Name,
            last_name: values.lastName,
            phone_number: values.phoneNumber,
            national_code: values.nationalCode,
            signature_image: images.signatureImage.length > 0 ? images.signatureImage[0].originFileObj : null,
            temp_image: images.tempImage.length > 0 ? images.tempImage[0].originFileObj : null,
            is_staff: values.isStaff,
        };

        try {
            await createUser(payload);
            message.success("کاربر با موفقیت اضافه شد.");
            onSubmit(payload);
            form.resetFields();
            setImages({ signatureImage: [], tempImage: [] });
        } catch (error) {
            message.error("مشکلی در افزودن کاربر به وجود آمده است.");
        }
    };

    return (
        <Modal
            title="کاربر جدید"
            width={"30%"}
            placement="left"
            onClose={onClose}
            open={visible}
            footer={false}
            centered
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={16} md={16}>
                        <div className="w-full flex flex-row justify-between">
                            <Form.Item name="signatureImage" label="امضا">
                                <FileUploader value={images.signatureImage} onChange={(fileList) => handleImageChange("signatureImage", fileList)} />
                            </Form.Item>
                            <Form.Item name="tempImage" label="تصویر کاربر">
                                <FileUploader value={images.tempImage} onChange={(fileList) => handleImageChange("tempImage", fileList)} />
                            </Form.Item>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                        <Form.Item name="userName" label="نام کاربری" rules={[{ required: true, message: "لطفا نام کاربری را وارد کنید!" }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                        <Form.Item name="password" label="رمز عبور" rules={[{ required: true, message: "لطفا رمز عبور را وارد کنید!" }]}>
                            <Input.Password />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                        <Form.Item name="Name" label="نام" rules={[{ required: true, message: "لطفا نام را وارد کنید!" }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                        <Form.Item name="lastName" label="نام خانوادگی" rules={[{ required: true, message: "لطفا نام خانوادگی را وارد کنید!" }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                        <Form.Item name="phoneNumber" label="شماره تلفن" rules={[{ required: true, message: "لطفا شماره تلفن را وارد کنید!" }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                        <Form.Item name="nationalCode" label="کد ملی" rules={[{ required: true, message: "لطفا کد ملی را وارد کنید!" }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                        <Form.Item name="isStaff" label="کارمند">
                            <Radio.Group defaultValue={false}>
                                <Radio.Button value={true}>بله</Radio.Button>
                                <Radio.Button value={false}>خیر</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                        <Form.Item name="isSuperuser" label="مدیر">
                            <Radio.Group defaultValue={false}>
                                <Radio.Button value={true}>بله</Radio.Button>
                                <Radio.Button value={false}>خیر</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                </Row>
                <div className="w-full flex flex-row justify-end gap-2">
                    <Button htmlType="submit" type="primary">تایید</Button>
                    <Button onClick={onClose}>لغو</Button>
                </div>
            </Form>
        </Modal>
    );
};

export default AddUsersModal;