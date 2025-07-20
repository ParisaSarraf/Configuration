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




const ProductModal = ({
    isOpen,
    modalMode,
    modalData,
    closeModal,
    refetch,
    productData
}) => {
    const [form] = Form.useForm();
    const { isPending: isCreating, mutateAsync: createProduct } = useCreateProduct();
    const { isPending: isUpdating, mutateAsync: updateProduct } = useUpdateProduct();
    const [selectedPersonalityId, setSelectedPersonalityId] = useState(null);
    const { data: casingData } = useOneCoreSetting("casing");
    const { data: genusData } = useGenusProductList();
    const [selectedParentCodeId, setSelectedParentCodeId] = useState(null);
    const [productCoding, setProductCoding] = useState(null);
    const { data: parentCodeData } = useFinalCodeProductById(selectedParentCodeId);
    const { data: personalityData, isLoading } = usePersonalityProductList();
    const { data: standardCodesResponse } = useStandardCodePersonalityById(selectedPersonalityId);
    const [productCode, setProductCode] = useState("");
    const [finalCode, setFinalCode] = useState("");

    const parentCodeId = parentCodeData?.code || "";

    useEffect(() => {
        if (parentCodeId || productCode) {
            const newFinalCode = `${parentCodeId || ""}${parentCodeId && productCode ? "" : ""}${productCode || ""}`;
            setFinalCode(newFinalCode);
            form.setFieldsValue({ final_code: newFinalCode });
        }
    }, [parentCodeId, productCode, form]);

    const handleParentChange = (value) => {
        setSelectedParentCodeId(value);
    };

    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.resetFields()
            form.setFieldsValue({
                persian_title: modalData.persian_title,
                code: modalData.code,
                quantity: modalData.quantity,
                store_code: modalData.store_code,
                status: modalData.status,
                weight: modalData.weight,
                height: modalData.height,
                width: modalData.width,
                length: modalData.length,
                price: modalData.price,
                external_diagonal: modalData.external_diagonal,
                internal_diagonal: modalData.internal_diagonal,
                parent_id: modalData.parent_code,
                parent_code_id: modalData.parent_code,
                casing_id: modalData.casing?.id,
                genus_id: modalData.genus?.id,
                alternative_genus_id: modalData.alternative_genus?.id,
                pro_type: modalData.pro_type,
                description: modalData.description,
                brand1: modalData.brand1,
                brand1_desc: modalData.brand1_desc,
                personality_type: modalData.personality_type,
                personality_ids: modalData.product_personalities?.map(p => p.personality.id),
                brand2: modalData.brand2,
                brand2_desc: modalData.brand2_desc,
                employer_code: modalData.employer_code,
                standard_code: modalData.standard_code,
                final_code: modalData.final_code || (parentCodeId ? parentCodeId : ""),
                // image: modalData.image
                //     ? [
                //         {
                //             uid: "-1",
                //             name: "image",
                //             url: BASEURL.replace("/api/v1", "") + modalData.image,
                //         },
                //     ]
                //     : [],
            });
        } else if (modalMode === "add") {
            form.resetFields();
            if (parentCodeId) {
                form.setFieldsValue({
                    final_code: parentCodeId + productCoding,
                });
            }
        } else if (modalMode === "addToParent") {
            form.resetFields();
            form.setFieldsValue({
                parent_id: modalData.id,
                parent_code_id: modalData.id,
                final_code: parentCodeId ? parentCodeId + "/" : ""
            });
        } else {
            form.resetFields();
            setFinalCode(null)
        }
    }, [modalMode, modalData, form, parentCodeId]);

    const onFinish = (values) => {
        if (values.personality_ids && !Array.isArray(values.personality_ids)) {
            values.personality_ids = [values.personality_ids];
        }

        const payload = {
            parent_id: values.parent_id,
            casing_id: values.casing_id,
            genus_id: values.genus_id,
            alternative_genus_id: values.alternative_genus_id,
            parent_code_id: values.parent_code_id,
            personality_ids: Array.isArray(values.personality_ids)
                ? values.personality_ids
                : values.personality_ids
                    ? [values.personality_ids]
                    : [],
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
            price: values.price,
            external_diagonal: values.external_diagonal,
            internal_diagonal: values.internal_diagonal,
            description: values.description,
            personality_type: values.personality_type,
            brand1: values.brand1,
            brand1_desc: values.brand1_desc,
            brand2: values.brand2,
            brand2_desc: values.brand2_desc,
            employer_code: values.employer_code,
            standard_code_id: values.standard_code_id,
            // image: values.image?.[0]?.originFileObj
        };

        if (modalMode === "add" || modalMode === "addToParent") {
            createProduct(payload)
                .then(() => {
                    message.success("محصول با موفقیت اضافه شد");
                    closeModal();
                    refetch();
                })
                .catch((error) => {
                    if (error.response?.status === 400 &&
                        error.response?.data?.includes("محصول با این کد وجود دارد")) {
                        message.error("محصول با این کد وجود دارد");
                    } else {
                        message.error(error.response?.data?.message || "خطا در افزودن محصول");
                    }
                    console.error(error);
                });
        } else if (modalMode === "edit") {
            updateProduct({
                productId: modalData.id,
                ...payload
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
    }

    return (
        <Modal
            isOpen={isOpen}
            title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} محصول`}
            size={1000}
            onClose={closeModal}
            onSubmit={() => form.submit()}
            mode={modalMode}
            loading={isCreating || isUpdating}
            className={'scroll-modal'}
        >

            <Form form={form} layout="horizontal" onFinish={onFinish}>
                <Row gutter={[6, 0]}>
                    <Col span={8}>
                        <Form.Item name="parent_id" label="شاخه والد">
                            <TS
                                data={productData}
                                placeholder="شاخه والد"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="parent_code_id" label="ارث بری کد">
                            <TS data={productData} placeholder="ارث بری کد" onChange={handleParentChange} />
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
                        <Form.Item name="code" rules={[{ required: true, message: "لطفاً کد محصول را وارد کنید" }]}>
                            <Input
                                addonBefore="کد محصول"
                                value={productCode}
                                onChange={(e) => setProductCode(e.target.value)}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="final_code">
                            <Input addonBefore="کد نهایی" value={finalCode} disabled />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item name="brand1">
                            <Input addonBefore="نام تجاری 1" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="brand1_desc">
                            <Input addonBefore="شرح نام تجاری1" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="quantity"
                            rules={[{ required: true, message: "لطفاً تعداد محصول را وارد کنید" }]}
                        >
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
                            <Input addonBefore="شرح نام تجاری2" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="employer_code">
                            <Input addonBefore="کدکارفرما" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="personality_ids"
                            rules={[{ required: true, message: "لطفاً هویت را انتخاب کنید" }]}
                        >
                            <TS
                                data={personalityData}
                                placeholder="هویت"
                                onChange={(value) => {
                                    setSelectedPersonalityId(value);
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="standard_code_id">
                            <Select
                                placeholder="کد استاندارد"
                                showSearch
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
                        <Form.Item name="genus_id">
                            <TS
                                data={genusData}
                                placeholder="جنس"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="alternative_genus_id">
                            <TS
                                data={genusData}
                                placeholder="جنس جایگزین"
                            />

                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="casing_id">
                            <TS
                                data={casingData}
                                placeholder="پوشش"
                            />
                        </Form.Item>
                    </Col>
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
                        <Form.Item name="store_code">
                            <Input addonBefore="کد انبار" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="status">
                            <Select
                                placeholder="وضعیت"
                                addonBefore="وضعیت"
                                options={[
                                    { label: 'فعال', value: 'active' },
                                    { label: 'غیرفعال', value: 'inactive' },
                                    { label: 'موقت', value: 'temp' }
                                ]}
                            />
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
                    {/* <Col span={24}>
                        <Form.Item
                            label={`بارگذاری عکس محصول`}
                            name='image'
                        >
                            <FileUploader />
                        </Form.Item>
                    </Col> */}
                </Row>
            </Form>
        </Modal>
    );
};

export default ProductModal;