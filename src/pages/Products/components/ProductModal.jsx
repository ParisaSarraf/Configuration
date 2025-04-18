import { Col, Divider, Form, Input, InputNumber, message, Row, Select } from "antd";
import React, { useEffect } from "react";
import { useCreateProduct, useUpdateProduct } from "../../../QueryServises/productQuery";
import { useOneCoreSetting } from "../../../QueryServises/settingQuery";
import { useGenusProductList } from "../../../QueryServises/genusQuery";
import Modal from "../../../components/Modal";

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
                persian_title: modalData.name || '',
                code: modalData.code,
                alternative_code: modalData.alternative_code,
                product_number: modalData.product_number,
                store_code: modalData.store_code,
                status: modalData.status,
                weight: modalData.weight,
                height: modalData.height,
                width: modalData.width,
                length: modalData.length,
                price: modalData.price,
                external_diagonal: modalData.external_diagonal,
                internal_diagonal: modalData.internal_diagonal,
                parent_id: modalData.parent_id || null,
                casing_id: modalData.casing_id,
                genus_id: modalData.genus_id,
                personality_id: modalData.personality_id,
                pro_type: modalData.pro_type,
                description: modalData.description,
                brand1: modalData.brand1,
                brand1_desc: modalData.brand1_desc,
                brand2: modalData.brand2,
                brand2_desc: modalData.brand2_desc,
                employer_code: modalData.employer_code,
                standard_code: modalData.standard_code,
                alternative_genus_id: modalData.alternative_genus_id
            });
        } else if (modalMode === "add") {
            form.resetFields();
            form.setFieldsValue({
                status: 'active',
                parent_id: null,
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
        const payload = {
            parent_id: values.parent_id,
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
            casing_id: values.casing_id ? Number(values.casing_id) : null,
            genus_id: values.genus_id ? Number(values.genus_id) : null,
            personality_id: values.personality_id ? Number(values.personality_id) : null,
            pro_type: values.pro_type ? Number(values.pro_type) : null,
            description: values.description || null,
            brand1: values.brand1 || null,
            brand1_desc: values.brand1_desc || null,
            brand2: values.brand2 || null,
            brand2_desc: values.brand2_desc || null,
            employer_code: values.employer_code || null,
            standard_code: values.standard_code || null,
            alternative_genus_id: values.alternative_genus_id ? Number(values.alternative_genus_id) : null
        };

        if (modalMode === "add") {
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

    const getParentOptions = () => {
        if (!productData) return [];
        const flattenProductList = (items) => {
            let result = [];
            items.forEach(item => {
                result.push({
                    id: item.id,
                    code: item.code,
                    persian_title: item.persian_title,
                    parent_id: item.parent_id
                });
                if (item.children && item.children.length > 0) {
                    result = result.concat(flattenProductList(item.children));
                }
            });
            return result;
        };
        const allProducts = flattenProductList(productData);
        return allProducts
            .filter(product => {
                if (modalMode === "edit") {
                    if (product.id === modalData?.id) return false;

                    const isChildOfCurrent = (items, targetId) => {
                        return items.some(item => {
                            if (item.id === targetId) return true;
                            if (item.children && item.children.length > 0) {
                                return isChildOfCurrent(item.children, targetId);
                            }
                            return false;
                        });
                    };
                    return !isChildOfCurrent([modalData], product.id);
                }
                return true;
            })
            .map(product => ({
                label: `${product.code} - ${product.persian_title}`,
                value: product.id,
                disabled: modalMode === "edit" && product.id === modalData?.parent_id
            }));
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
            bodyStyle={{
                padding: 0
            }}
            style={{
                top: 20
            }}
        >
            <div style={{
                maxHeight: "70vh",
                overflowY: "auto",
                padding: "0 24px"
            }}>
                <Form
                    form={form}
                    layout="horizontal"
                    onFinish={onFinish}
                    initialValues={{
                        status: 'active',
                        parent_id: null
                    }}
                >
                    <Row gutter={[16, 16]}>
                        <Col span={8}>
                            <Form.Item name="parent_id">
                                <Select
                                    addonBefore="شاخه والد"
                                    showSearch
                                    placeholder=" شاخه والد"
                                    options={getParentOptions()}
                                    allowClear
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="parent_code_id">
                                <Select
                                    addonBefore="ارث بری کد"
                                    showSearch
                                    placeholder="ارث بری کد"
                                    options={getParentOptions()}
                                    allowClear
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="persian_title"
                                rules={[{ required: true, message: "لطفاً عنوان فارسی را وارد کنید" }]}
                            >
                                <Input addonBefore="عنوان فارسی" />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                name="code"
                                rules={[{ required: true, message: "لطفاً کد محصول را وارد کنید" }]}
                            >
                                <Input addonBefore="کد محصول"  />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="brand1">
                                <Input addonBefore="نام تجاری 1"  />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="brand1_desc">
                                <Input addonBefore="شرح نام تجاری1"  />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="product_number">
                                <InputNumber
                                    addonBefore="تعداد"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="brand2">
                                <Input addonBefore="نام تجاری 2" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="brand2_desc">
                                <Input addonBefore="شرح نام تجاری2"/>
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="employer_code">
                                <Input addonBefore="کدکارفرما" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="standard_code">
                                <Input addonBefore="کد استاندارد"  />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="status">
                                <Select
                                    addonBefore="وضعیت"
                                    options={[
                                        { label: 'فعال', value: 'active' },
                                        { label: 'غیرفعال', value: 'inactive' }
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Divider dashed />

                        <Col span={8}>
                            <Form.Item name="personality_id">
                                <Select
                                    placeholder="هویت"
                                    options={personalityData?.map(personality => ({
                                        label: `${personality.name}`,
                                        value: personality.id
                                    }))}
                                    allowClear
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="genus_id">
                                <Select
                                    placeholder="جنس"
                                    options={genusData?.map(genus => ({
                                        label: `${genus.name}`,
                                        value: genus.id
                                    }))}
                                    allowClear
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="alternative_genus_id">
                                <Select
                                    placeholder="جنس جایگزین"
                                    options={genusData?.map(genus => ({
                                        label: `${genus.name}`,
                                        value: genus.id
                                    }))}
                                    allowClear
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="casing_id">
                                <Select
                                    placeholder="پوشش"
                                    options={casingData?.map(casing => ({
                                        label: `${casing.name}`,
                                        value: casing.id
                                    }))}
                                    allowClear
                                />
                            </Form.Item>
                        </Col>
                        <Divider dashed />

                        <Col span={8}>
                            <Form.Item name="length">
                                <InputNumber
                                    addonBefore="طول"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="width">
                                <InputNumber
                                    addonBefore="عرض"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="height">
                                <InputNumber
                                    addonBefore="ارتفاع"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="internal_diagonal">
                                <InputNumber
                                    addonBefore="قطر داخل"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="external_diagonal">
                                <InputNumber
                                    addonBefore="قطر خارجی"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="weight">
                                <InputNumber
                                    addonBefore="وزن"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="price">
                                <InputNumber
                                    addonBefore="قیمت"
                                    style={{ width: '100%' }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '،')}
                                    parser={(value) => value.replace(/\$\s?|(،*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="code">
                                <Input addonBefore="کد نهایی" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="store_code">
                                <Input addonBefore="کد انبار" />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item name="description">
                                <Input.TextArea
                                    addonBefore="توضیحات"
                                    rows={1}
                                    placeholder="توضیحات محصول"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>
        </Modal>
    );
};

export default ProductModal;