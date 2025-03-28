import React, { useEffect } from "react";
import { Button, Col, Form, Input, message, Row } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useCreateUser, useUpdateUser } from "../../../../../QueryServises/userQuery";
import Modal from "../../../../../components/Modal";
import { useCreateCoreSetting, useUpdateCoreSetting } from "../../../../../QueryServises/settingQuery";

const CasingModal = ({ isOpen, modalMode, modalData, closeModal, setModal, refetch }) => {
    const [form] = Form.useForm();
    const { isPending: isCreating, mutateAsync: createCasing } = useCreateCoreSetting();
    const { isPending: isUpdating, mutateAsync: updateCasing } = useUpdateCoreSetting();

    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                name: modalData.name,
            });
        } else if (modalMode === "add") {
            form.resetFields();
        }
    }, [modalMode, modalData, form]);

    const onFinishForm = (values) => {
        const payload = {
            name: values.name,
            type: "casing"
        };

        if (modalMode === "add") {
            createCasing(payload)
                .then(() => {
                    message.success("پوشش با موفقیت اضافه شد");
                    closeModal();
                    refetch();
                })
                .catch((error) => {
                    message.error("موفقیت آمیز نبود، دوباره امتحان کنید");
                    console.error(error);
                });
        } else if (modalMode === "edit") {
            updateCasing({ casingId: modalData.id, updateData: payload })
                .then(() => {
                    message.success("کاربر با موفقیت ویرایش شد");
                    closeModal();
                    refetch();
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
                <span className="xs:hidden sm:hidden md:inline">افزودن پوشش</span>
            </Button>
            <Modal
                isOpen={isOpen}
                title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} پوشش`}
                size={600}
                onClose={closeModal}
                onSubmit={() => form.submit()}
                mode={modalMode}
                loading={isCreating || isUpdating}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinishForm}
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="name"
                                label="پوشش "
                                rules={[{ required: true, message: "لطفاً  پوشش را وارد کنید" }]}
                            >
                                <Input placeholder=" پوشش" />
                            </Form.Item>
                        </Col>

                    </Row>
                </Form>
            </Modal>
        </>
    );
};

export default CasingModal;