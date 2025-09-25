import React, {useEffect, useState} from "react";
import { Button, Col, Form, Input, message, Row, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Modal from "../../../../../components/Modal";
import { useCreateGenusProduct, useUpdateGenusProduct, useGenusProductList } from "../../../../../QueryServises/genusQuery";
import TS from "@/components/TreeSelect/index.jsx";

const GenusModal = ({ isOpen, modalMode, modalData, closeModal, setModal, refetch }) => {
    const [form] = Form.useForm();
    const { data: genusList, isFetching: isFetchingGenus } = useGenusProductList();
    const { isPending: isCreating, mutateAsync: createGenus } = useCreateGenusProduct();
    const { isPending: isUpdating, mutateAsync: updateGenus } = useUpdateGenusProduct();

    const [selectedGenusId, setSelectedGenusId] = useState(null);


    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                name: modalData.name,
                parent_id: modalData.parentId || undefined
            });
        } else if (modalMode === "add") {
            form.resetFields();
        }
    }, [modalMode, modalData, form]);

    const onFinishForm = (values) => {
        const payload = {
            name: values.name,
            ...(values.parent_id !== undefined && { parent_id: values.parent_id })
        };

        if (modalMode === "add") {
            createGenus(payload)
                .then(() => {
                    message.success("جنس با موفقیت اضافه شد");
                    closeModal();
                    refetch();
                })
                .catch((error) => {
                    message.error(error.response?.data?.message || "موفقیت آمیز نبود، دوباره امتحان کنید");
                    console.error(error);
                });
        } else if (modalMode === "edit") {
            if (!modalData?.id) {
                message.error("شناسه جنس معتبر نیست");
                return;
            }

            updateGenus({
                genusId: modalData.id,
                ...payload
            })
                .then(() => {
                    message.success("جنس با موفقیت ویرایش شد");
                    closeModal();
                    refetch();
                })
                .catch((error) => {
                    message.error(error.response?.data?.message || "موفقیت آمیز نبود، دوباره امتحان کنید");
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
                />
            <Modal
                isOpen={isOpen}
                title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} جنس`}
                size={600}
                onClose={closeModal}
                onSubmit={() => form.submit()}
                mode={modalMode}
                loading={isCreating || isUpdating || isFetchingGenus}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinishForm}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="نام جنس"
                                rules={[{ required: true, message: "لطفاً نام جنس را وارد کنید" }]}
                            >
                                <Input placeholder="نام جنس" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="parent_id"
                                label="جنس والد (اختیاری)"
                            >
                                <TS
                                    data={genusList}
                                    placeholder="جنس والد (اختیاری)"
                                    onChange={(value) => setSelectedGenusId(value)}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
};

export default GenusModal;