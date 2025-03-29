import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, message, Row } from "antd";
import React, { useEffect, useState } from "react";
import Modal from "../../../components/Modal";
import { useCreateProduct, useUpdateProduct } from "../../../QueryServises/productQuery";

const ProductModal = ({ isOpen, modalMode, modalData, closeModal, setModal, refetch }) => {
    const [form] = Form.useForm();
    const { isPending: isCreating, mutateAsync: createProduct } = useCreateProduct();
    const { isPending: isUpdating, mutateAsync: updateProduct } = useUpdateProduct();

    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                name: modalData.name,
            });
        } else if (modalMode === "add") {
            form.resetFields();
        }
    }, [modalMode, modalData, form]);

    const onFinish = (values) => {
        const payload = {
            parent_id: parentId,
            casing_id: casingId,
            genus_id: genusId,
            personality_id: personalityId,
            code: code,
            persian_title: persianTitle,
            product_number: productNumber,
            alternative_code: alternativeCode,
            pro_type: proType,
            parent_code_id: parentCodeId,
            weight: weight,
            height: height,
            width: width,
            length: lengthCode,
            price: price,
            external_diagonal: externalDiagonal,
            internal_diagonal: internalDiagonal,
            status: statusCode,
            store_code: storeCode,
            description: description

        };

        if (modalMode === "add") {
            console.log(payload)
            createProduct(payload)
                .then(() => {
                    message.success("محصول با موفقیت اضافه شد")
                    closeModal();
                    refetch();
                })
                .catch((error) => {
                    message.error("موفقیت آمیز نبود، دوباره امتحان کنید");
                    console.error(error);
                });
        } else if (modalMode === "edit") {
            updateProduct({ roleId: modalData.id, ...payload })
                .then(() => {
                    message.success("محصول با موفقیت ویرایش شد");
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
        <div>
            <Modal
                isOpen={isOpen}
                title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} محصول`}
                size={1000}
                onClose={closeModal}
                onSubmit={() => form.submit()}
                mode={modalMode}
                loading={isCreating || isUpdating}
            >
                <Form
                    layout="horizontal"
                    form={form}
                    onFinish={onFinish}
                    className="pl-4 h-80 overflow-y-scroll overflow-hidden"
                >
                    <Row gutter={[16, 16]}>
                        {[
                            // { name: "casingId", label: "شناسه پوشش" },
                            // { name: "genusId", label: "شناسه کلاس" },
                            // { name: "personalityId", label: "شناسه شخصیت" },
                            { name: "parentCodeId", label: "شناسه کد والد" },
                            { name: "parentId", label: "ایدی والد" },
                            { name: "persianTitle", label: "عنوان فارسی" },
                            { name: "code", label: "کد محصول" },
                            { name: "productNumber", label: "شماره محصول" },
                            { name: "alternativeCode", label: "کد جایگزین" },
                            { name: "proType", label: "نوع حرفه ای" },
                            { name: "lengthCode", label: "طول" },
                            { name: "width", label: "عرض" },
                            { name: "height", label: "ارتفاع" },
                            { name: "weight", label: "وزن" },
                            { name: "externalDiagonal", label: "قطر خارجی" },
                            { name: "internalDiagonal", label: "قطر داخلی" },
                            { name: "statusCode", label: "وضعیت" },
                            { name: "storeCode", label: "رمز فروشگاه" },
                            { name: "price", label: "قیمت" },
                        ].map((item, index) => (
                            <Col span={8} key={index}>
                                <Form.Item
                                    name={item.name}
                                    label={item.label}
                                    className="uniform-form-item"
                                >
                                    <Input placeholder="" style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        ))}

                        <Col span={24}>
                            <Form.Item
                                name="description"
                                label="توضیحات"
                                className="uniform-form-item"
                            >
                                <Input.TextArea
                                    rows={1}
                                    style={{ width: '100%' }}
                                    placeholder="توضیحات کامل را وارد کنید..."
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div >
    );
};

export default ProductModal;   