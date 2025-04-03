import { Col, Form, Input, InputNumber, message, Row, Select } from "antd";
import React, { useEffect } from "react";
import Modal from "../../../components/Modal";
import { useCreateProduct, useUpdateProduct } from "../../../QueryServises/productQuery";
import { useOneCoreSetting } from "../../../QueryServises/settingQuery";
import { useGenusProductList } from "../../../QueryServises/genusQuery";

const ProductModal = ({ isOpen, modalMode, modalData, closeModal, setModal, refetch, productData }) => {
    const [form] = Form.useForm();
    const { isPending: isCreating, mutateAsync: createProduct } = useCreateProduct();
    const { isPending: isUpdating, mutateAsync: updateProduct } = useUpdateProduct();
    const { data: casingData } = useOneCoreSetting("casing");
    const { data: personalityData } = useOneCoreSetting("personality");
    const { data: genusData } = useGenusProductList();


    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                persian_title: modalData.persian_title || null,
                code: modalData.code || null,
                alternative_code: modalData.alternative_code || null,
                product_number: modalData.product_number || null,
                store_code: modalData.store_code || null,
                status: modalData.status || 'active',
                weight: modalData.weight ? Number(modalData.weight) : null,
                height: modalData.height ? Number(modalData.height) : null,
                width: modalData.width ? Number(modalData.width) : null,
                length: modalData.length ? Number(modalData.length) : null,
                price: modalData.price ? Number(modalData.price) : null,
                external_diagonal: modalData.external_diagonal ? Number(modalData.external_diagonal) : null,
                internal_diagonal: modalData.internal_diagonal ? Number(modalData.internal_diagonal) : null,
                parent_code_id: modalData.parent_code_id || null,
                casing_id: modalData.casing_id ? Number(modalData.casing_id) : null,
                genus_id: modalData.genus_id ? Number(modalData.genus_id) : null,
                personality_id: modalData.personality_id ? Number(modalData.personality_id) : null,
                pro_type: modalData.pro_type ? Number(modalData.pro_type) : null,
                description: modalData.description || null
            });
        } else if (modalMode === "add") {
            form.resetFields();
            form.setFieldsValue({
                status: 'active',
                parent_code_id: null,
                pro_type: null,
                weight: null,
                height: null,
                width: null,
                length: null,
                price: null,
                external_diagonal: null,
                internal_diagonal: null
            });
        }
    }, [modalMode, modalData, form]);

    const onFinish = (values) => {
        console.log("hi");

        const payload = {
            persian_title: values.persian_title,
            code: values.code,
            alternative_code: values.alternative_code || null,
            product_number: values.product_number || null,
            store_code: values.store_code || null,
            status: values.status || 'active',
            weight: values.weight ? Number(values.weight) : null,
            height: values.height ? Number(values.height) : null,
            width: values.width ? Number(values.width) : null,
            length: values.length ? Number(values.length) : null,
            price: values.price ? Number(values.price) : null,
            external_diagonal: values.external_diagonal ? Number(values.external_diagonal) : null,
            internal_diagonal: values.internal_diagonal ? Number(values.internal_diagonal) : null,
            parent_code_id: values.parent_code_id || null,
            casing_id: values.casing_id ? Number(values.casing_id) : null,
            genus_id: values.genus_id ? Number(values.genus_id) : null,
            personality_id: values.personality_id ? Number(values.personality_id) : null,
            pro_type: values.pro_type ? Number(values.pro_type) : null,
            description: values.description || null
        };

        console.log(payload);
        console.log(modalMode);

        if (modalMode === "add") {
            console.log("in toe");
            createProduct(payload)
                .then(() => {
                    message.success("محصول با موفقیت اضافه شد");
                    closeModal();
                    refetch();
                })
                .catch((error) => {
                    message.error(error.response?.data?.message || "خطا در افزودن محصول");
                    console.error(error);
                });
        } else if (modalMode === "edit") {
            updateProduct({
                productId: modalData.id,
                data: payload
            })
                .then(() => {
                    message.success("محصول با موفقیت ویرایش شد");
                    closeModal();
                    refetch();
                })
                .catch((error) => {
                    message.error(error.response?.data?.message || "خطا در ویرایش محصول");
                    console.error(error);
                });
        }
    };


    return (
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
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    status: 'active',
                    parent_code_id: null
                }}
            >
                <Row gutter={[14, 14]}>
                    <Col span={4}>
                        <Form.Item
                            name="persian_title"
                            label="عنوان فارسی"
                            rules={[{ required: true, message: "لطفاً عنوان فارسی را وارد کنید" }]}
                        >
                            <Input placeholder="عنوان فارسی محصول" />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name="code"
                            label="کد محصول"
                            rules={[{ required: true, message: "لطفاً کد محصول را وارد کنید" }]}
                        >
                            <Input placeholder="کد منحصربفرد محصول" />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name="alternative_code"
                            label="کد جایگزین"
                        >
                            <Input placeholder="کد جایگزین محصول" />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name="product_number"
                            label="شماره محصول"
                        >
                            <Input placeholder="شماره محصول" />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name="store_code"
                            label="کد انبار"
                        >
                            <Input placeholder="کد انبار محصول" />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name="status"
                            label="وضعیت"
                        >
                            <Select
                                placeholder="وضعیت محصول را انتخاب کنید"
                                options={[
                                    { label: 'فعال', value: 'active' },
                                    { label: 'غیرفعال', value: 'inactive' }
                                ]}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={4}>
                        <Form.Item
                            name="weight"
                            label="وزن (گرم)"
                        >
                            <InputNumber style={{ width: '100%' }} placeholder="وزن محصول" />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name="height"
                            label="ارتفاع (سانتی‌متر)"
                        >
                            <InputNumber style={{ width: '100%' }} placeholder="ارتفاع محصول" />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name="width"
                            label="عرض (سانتی‌متر)"
                        >
                            <InputNumber style={{ width: '100%' }} placeholder="عرض محصول" />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name="length"
                            label="طول (سانتی‌متر)"
                        >
                            <InputNumber style={{ width: '100%' }} placeholder="طول محصول" />
                        </Form.Item>
                    </Col>

                    <Col span={4}>
                        <Form.Item
                            name="external_diagonal"
                            label="قطر خارجی (سانتی‌متر)"
                        >
                            <InputNumber style={{ width: '100%' }} placeholder="قطر خارجی" />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name="internal_diagonal"
                            label="قطر داخلی (سانتی‌متر)"
                        >
                            <InputNumber style={{ width: '100%' }} placeholder="قطر داخلی" />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name="price"
                            label="قیمت (ریال)"
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="قیمت محصول"
                                formatter={(value) =>
                                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '،')
                                }
                                parser={(value) =>
                                    value.replace(/\$\s?|(،*)/g, '')
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name="pro_type"
                            label="نوع محصول"
                        >
                            <InputNumber style={{ width: '100%' }} placeholder="نوع محصول" />
                        </Form.Item>
                    </Col>

                    <Col span={4}>
                        <Form.Item
                            name="parent_code_id"
                            label="محصول والد"
                        >
                            <Select
                                showSearch
                                placeholder="محصول والد را انتخاب کنید"
                                options={productData?.map(product => ({
                                    label: `${product.code} - ${product.persian_title}`,
                                    value: product.id
                                }))}
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name="casing_id"
                            label="محفظه"
                        >
                            <Select
                                showSearch
                                placeholder="شناسه محفظه"
                                options={casingData?.map(casing => ({
                                    label: `${casing.name}`,
                                    value: casing.id
                                }))}
                                allowClear
                            />

                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name="genus_id"
                            label="جنس"
                        >
                            <Select
                                showSearch
                                placeholder="شناسه جنس"
                                options={genusData?.map(genus => ({
                                    label: `${genus.name}`,
                                    value: genus.id
                                }))}
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name="personality_id"
                            label="شخصیت"
                        >
                            <Select
                                showSearch
                                placeholder="شناسه شخصیت"
                                options={personalityData?.map(personality => ({
                                    label: `${personality.name}`,
                                    value: personality.id
                                }))}
                                allowClear
                            />
                        </Form.Item>
                    </Col>

                    {/* توضیحات */}
                    <Col span={24}>
                        <Form.Item
                            name="description"
                            label="توضیحات"
                        >
                            <Input.TextArea rows={4} placeholder="توضیحات محصول" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ProductModal;