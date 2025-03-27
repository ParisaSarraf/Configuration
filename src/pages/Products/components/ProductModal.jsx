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
                size={600}
                onClose={closeModal}
                onSubmit={() => form.submit()}
                mode={modalMode}
                loading={isCreating || isUpdating}
            >
                <Form layout="vertical" form={form} onFinish={onFinish}
                    className="pl-4 h-80 overflow-y-scroll overflow-hidden">
                    <Row gutter={[16, 16]}>
                        <Col span={8}>
                            <Form.Item name="parentId" label="ایدی والد">
                                <Input placeholder="" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="casingId" label="شناسه پوشش">
                                <Input placeholder="" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="genusId" label="شماسه کلاس">
                                <Input placeholder="" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="personalityId" label="شناسه شخصیت">
                                <Input placeholder="" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="code" label="کد">
                                <Input placeholder="" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="persianTitle" label="نام فارسی">
                                <Input placeholder="" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="productNumber" label="شماره محصول">
                                <Input placeholder="" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="alternativeCode" label="کد جایگزین">
                                <Input placeholder="" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="proType" label="نوع حرفه ای">
                                <Input placeholder="" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="parentCodeId" label="شناسه کد والد">
                                <Input placeholder="" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="weight" label="وزن">
                                <Input placeholder="" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="height" label="ارتفاع">
                                <Input placeholder="" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="width" label="عرض">
                                <Input placeholder="" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="lengthCode" label="طول">
                                <Input placeholder="" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="price" label="قیمت">
                                <Input placeholder="" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="externalDiagonal" label="مورب خارجی">
                                <Input placeholder="" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="internalDiagonal" label="مورب داخلی">
                                <Input placeholder="" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="statusCode" label="وضعیت">
                                <Input placeholder="" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="storeCode" label="رمز فروشگاه">
                                <Input placeholder="" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="description" label="توضیحات">
                                <Input placeholder="" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div >
    );
};

export default ProductModal;   