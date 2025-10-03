import { Col, Form, Input, InputNumber, message, Row, Select } from "antd";
import { useEffect, useState } from "react";
import { useCreateProduct, useFinalCodeProductById, useUpdateProduct } from "../../../QueryServises/productQuery";
import { useOneCoreSetting } from "../../../QueryServises/settingQuery";
import { useGenusProductList } from "../../../QueryServises/genusQuery";
import Modal from "../../../components/Modal";
import { usePersonalityProductList } from "@/QueryServises/personalityQuery/index.js";
import { SearchOutlined } from "@ant-design/icons";
import TS from "../../../components/TreeSelect";
import { useStandardCodePersonalityById } from "../../../QueryServises/StandardCodeQuery";

const ProductModal = ({ isOpen, modalMode, modalData, closeModal, refetch, productData }) => {
    const [form] = Form.useForm();

    const { isPending: isCreating, mutateAsync: createProduct } = useCreateProduct();
    const { isPending: isUpdating, mutateAsync: updateProduct } = useUpdateProduct();

    const [selectedPersonalityId, setSelectedPersonalityId] = useState(null);
    const [selectedParentCodeId, setSelectedParentCodeId] = useState(null);
    const [productCode, setProductCode] = useState("");
    const [finalCode, setFinalCode] = useState("");

    const { data: casingData } = useOneCoreSetting("casing");
    const { data: genusData } = useGenusProductList();
    const { data: personalityData } = usePersonalityProductList();
    const { data: parentCodeData } = useFinalCodeProductById(selectedParentCodeId);
    const { data: standardCodesResponse } = useStandardCodePersonalityById(selectedPersonalityId?.value);

    const parentCodeId = parentCodeData?.code || "";

    console.log(modalData);


    useEffect(() => {
        if (!isOpen) return;
        form.resetFields();
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                persian_title: modalData.persian_title,
                code: modalData.code,
                quantity: modalData.quantity,
                store_code: modalData.store_code,
                status: modalData.status,
                weight: modalData.weight,
                height: modalData.height,
                width: modalData.width,
                warehouse_code: modalData.warehouse_code,
                warehouse_quantity: modalData.warehouse_quantity,
                length: modalData.length,
                price: modalData.price,
                external_diagonal: modalData.external_diagonal,
                internal_diagonal: modalData.internal_diagonal,
                parent_id: modalData.parent_code,
                parent_code_id: modalData.parent_code,
                casing_id: modalData.casing
                    ? { value: modalData.casing.id, label: modalData.casing.name }
                    : null,
                genus_id: modalData.genus?.id
                    ? { value: modalData.genus.id, label: modalData.genus.name }
                    : null,
                alternative_genus_id: modalData.alternative_genus?.id
                    ? { value: modalData.alternative_genus.id, label: modalData.alternative_genus.name }
                    : null,
                pro_type: modalData.pro_type,
                description: modalData.description,
                brand1: modalData.brand1,
                brand1_desc: modalData.brand1_desc,
                personality_id: modalData.product_personalities?.map(
                    personality => personality?.personality?.id
                ),
                standard_code_id: modalData.standard_code?.id
                    ? { value: modalData.standard_code.id, label: modalData.standard_code.name }
                    : null,
                brand2: modalData.brand2,
                brand2_desc: modalData.brand2_desc,
                employer_code: modalData.employer_code,
                final_code: modalData.final_code || "",
            });
            setProductCode(modalData.code || "");
        } else if (modalMode === "addToParent" && modalData) {
            setSelectedParentCodeId(modalData.id);
            form.setFieldsValue({
                parent_id: modalData.id,
                parent_code_id: modalData.id,
                final_code: parentCodeId ? `${parentCodeId}` : ""
            });
        } else if (modalMode === "add") {
            form.setFieldsValue({
                parent_id: null,
                parent_code_id: null,
                final_code: parentCodeId || ""
            })
        }
    }, [modalMode, modalData, isOpen]);

    useEffect(() => {
        const newFinalCode = `${parentCodeId || ""}-${productCode || ""}`;
        setFinalCode(newFinalCode);
        form.setFieldsValue({ final_code: newFinalCode });
    }, [parentCodeId, productCode]);

    const handleParentChange = (value) => setSelectedParentCodeId(value);

    const onFinish = (values) => {
        const payload = {
            parent_id: values.parent_id?.value || null,
            parent_code_id: values.parent_code_id?.value || null,
            casing_id: values.casing_id?.value || null,
            genus_id: values.genus_id?.value || null,
            alternative_genus_id: values.alternative_genus_id?.value || null,
            standard_code_id: values.standard_code_id?.value || null,
            personality_id: values.personality_id?.value || null,
            code: values.code,
            persian_title: values.persian_title,
            quantity: values.quantity,
            alternative_code: values.alternative_code,
            pro_type: values.pro_type,
            store_code: values.store_code,
            status: values.status,
            weight: values.weight,
            height: values.height,
            width: values.width,
            length: values.length,
            warehouse_code: values.warehouse_code,
            warehouse_quantity: values.warehouse_quantity,
            price: values.price,
            external_diagonal: values.external_diagonal,
            internal_diagonal: values.internal_diagonal,
            description: values.description,
            brand1: values.brand1,
            brand1_desc: values.brand1_desc,
            brand2: values.brand2,
            brand2_desc: values.brand2_desc,
            employer_code: values.employer_code,
        };



        Object.keys(values).forEach((key) => {
            const newVal = values[key];
            const oldVal = modalData ? modalData[key] : undefined;
            if (newVal !== oldVal && newVal !== undefined) {
                payload[key] = newVal;
            }
        });
        if (modalMode === "edit" && values.code === modalData?.code) {
            delete payload.code;
        }

        const action =
            modalMode === "edit"
                ? updateProduct({ productId: modalData.id, ...payload })
                : createProduct(payload);

        action
            .then(() => {
                message.success(modalMode === "edit" ? "محصول ویرایش شد" : "محصول اضافه شد");
                closeModal();
                refetch();
            })
            .catch((error) => {
                message.error(error.response?.data?.message || "خطا در عملیات");
                console.error(error);
            });
    };

    return (
        <Modal
            isOpen={isOpen}
            title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} محصول`}
            size={1200}
            onClose={closeModal}
            onSubmit={() => form.submit()}
            mode={modalMode}
            loading={isCreating || isUpdating}
            className="scroll-modal"
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item name="parent_id" label="شاخه والد">
                            <TS labelInValue data={productData} placeholder="شاخه والد" allowClear />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="parent_code_id" label="ارث بری کد">
                            <TS labelInValue data={productData} placeholder="ارث بری کد" onChange={handleParentChange} allowClear />
                        </Form.Item>
                    </Col>

                    <Col span={4}>
                        <Form.Item
                            label="عنوان فارسی"
                            name="persian_title"
                            rules={[{ required: true, message: "لطفاً عنوان فارسی را وارد کنید" }]}
                        >
                            <Input placeholder="عنوان فارسی" />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            label="کد محصول"
                            name="code"
                            rules={[{ required: true, message: "لطفاً کد محصول را وارد کنید" }]}
                        >
                            <Input
                                placeholder="کد محصول"
                                value={productCode}
                                onChange={(e) => setProductCode(e.target.value)}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            label="تعداد"
                            name="quantity"
                            rules={[{ required: true, message: "لطفاً تعداد محصول را وارد کنید" }]}
                        >
                            <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label="کد نهایی" name="final_code">
                            <Input value={finalCode} disabled />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label="نام تجاری 1" name="brand1">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label="شرح نام تجاری 1" name="brand1_desc">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label="نام تجاری 2" name="brand2">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label="شرح نام تجاری 2" name="brand2_desc">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label="کد کارفرما" name="employer_code">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label="وضعیت" name="status">
                            <Select
                                placeholder="وضعیت"
                                style={{ width: "100%" }}
                                options={[
                                    { label: 'فعال', value: 'active' },
                                    { label: 'غیرفعال', value: 'inactive' },
                                    { label: 'موقت', value: 'temp' }
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label="هویت"
                            name="personality_id"
                            rules={[{ required: true, message: "لطفاً هویت را انتخاب کنید" }]}
                        >
                            <TS
                                labelInValue
                                data={personalityData}
                                placeholder="هویت"
                                onChange={(value) => setSelectedPersonalityId(value)}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="کد استاندارد" name="standard_code_id">
                            <Select
                                allowClear
                                labelInValue
                                placeholder="کد استاندارد"
                                showSearch
                                style={{ width: "100%" }}
                                options={standardCodesResponse?.personality_codes?.map(item => ({
                                    value: item.id,
                                    label: item.name
                                })) || []}
                                disabled={standardCodesResponse?.personality_codes.length === 0}
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().includes(input.toLowerCase())
                                }
                                suffixIcon={<SearchOutlined />}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="جنس" name="genus_id">
                            <TS labelInValue data={genusData} placeholder="جنس" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="جنس جایگزین" name="alternative_genus_id">
                            <TS labelInValue data={genusData} placeholder="جنس جایگزین" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="پوشش" name="casing_id">
                            <TS labelInValue data={casingData} placeholder="پوشش" />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label="قیمت" name="price">
                            <InputNumber
                                style={{ width: "100%" }}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '،')}
                                parser={(value) => value.replace(/\$\s?|(،*)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label="کد انبار" name="store_code">
                            <Input />
                        </Form.Item>
                    </Col>


                    <Col span={4}>
                        <Form.Item label="کد کالا" name="warehouse_code">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label="تعداد انبار" name="warehouse_quantity">
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={2}>
                        <Form.Item label="طول" name="length">
                            <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={2}>
                        <Form.Item label="عرض" name="width">
                            <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={2}>
                        <Form.Item label="ارتفاع" name="height">
                            <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={2}>
                        <Form.Item label="قطر داخل" name="internal_diagonal">
                            <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label="قطر خارجی" name="external_diagonal">
                            <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label="وزن" name="weight">
                            <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item label="توضیحات" name="description">
                            <Input.TextArea rows={1} placeholder="توضیحات محصول" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>

    );
};

export default ProductModal;
