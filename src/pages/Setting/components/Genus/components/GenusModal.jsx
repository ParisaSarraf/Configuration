import React, { useEffect } from "react";
import { Button, Col, Form, Input, message, Row, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Modal from "../../../../../components/Modal";
import { useCreateGenusProduct, useUpdateGenusProduct, useGenusProductList } from "../../../../../QueryServises/genusQuery";

const GenusModal = ({ isOpen, modalMode, modalData, closeModal, setModal, refetch }) => {
    const [form] = Form.useForm();
    const { data: genusList, isFetching: isFetchingGenus } = useGenusProductList();
    const { isPending: isCreating, mutateAsync: createGenus } = useCreateGenusProduct();
    const { isPending: isUpdating, mutateAsync: updateGenus } = useUpdateGenusProduct();

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

    const getParentOptions = () => {
        if (!genusList) return [];

        const flattenGenusList = (items) => {
            let result = [];
            items.forEach(item => {
                result.push({
                    id: item.id,
                    name: item.name,
                    parent: item.parent
                });
                if (item.children && item.children.length > 0) {
                    result = result.concat(flattenGenusList(item.children));
                }
            });
            return result;
        };

        const allGenus = flattenGenusList(genusList);

        return allGenus
            .filter(genus => {
                if (modalMode !== "edit") return true;

                if (genus.id === modalData?.id) return false;

                const isChildOfCurrent = (items, parentId) => {
                    return items.some(item => {
                        if (item.id === parentId) return true;
                        if (item.children && item.children.length > 0) {
                            return isChildOfCurrent(item.children, parentId);
                        }
                        return false;
                    });
                };

                return !isChildOfCurrent(genusList, modalData?.id);
            })
            .map(genus => ({
                label: genus.name,
                value: genus.id
            }));
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
                        <Col span={24}>
                            <Form.Item
                                name="name"
                                label="نام جنس"
                                rules={[{ required: true, message: "لطفاً نام جنس را وارد کنید" }]}
                            >
                                <Input placeholder="نام جنس" />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="parent_id"
                                label="جنس والد (اختیاری)"
                            >
                                <Select
                                    placeholder="انتخاب جنس والد"
                                    loading={isFetchingGenus}
                                    allowClear
                                    options={getParentOptions()}
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