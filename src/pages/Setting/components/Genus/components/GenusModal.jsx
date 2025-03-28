import React, { useEffect } from "react";
import { Button, Col, Form, Input, message, Row } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Modal from "../../../../../components/Modal";
import { useCreateCoreSetting, useUpdateCoreSetting } from "../../../../../QueryServises/settingQuery";

const GenusModal = ({ isOpen, modalMode, modalData, closeModal, setModal, refetch }) => {
    const [form] = Form.useForm();
    const { isPending: isCreating, mutateAsync: createGenus } = useCreateCoreSetting();
    const { isPending: isUpdating, mutateAsync: updateGenus } = useUpdateCoreSetting();

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
            type: "genus"
        };

        if (modalMode === "add") {
            createGenus(payload)
                .then(() => {
                    message.success("جنس با موفقیت اضافه شد");
                    closeModal();
                    refetch();
                })
                .catch((error) => {
                    message.error("موفقیت آمیز نبود، دوباره امتحان کنید");
                    console.error(error);
                });
        } else if (modalMode === "edit") {
            updateGenus({ GenusId: modalData.id, updateData: payload })
                .then(() => {
                    message.success("جنس با موفقیت ویرایش شد");
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
                <span className="xs:hidden sm:hidden md:inline">افزودن جنس</span>
            </Button>
            <Modal
                isOpen={isOpen}
                title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} جنس`}
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
                                label="جنس"
                                rules={[{ required: true, message: "لطفاً  جنس را وارد کنید" }]}
                            >
                                <Input placeholder=" جنس" />
                            </Form.Item>
                        </Col>

                    </Row>
                </Form>
            </Modal>
        </>
    );
};

export default GenusModal;