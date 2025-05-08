import { Col, Divider, Form, Input, InputNumber, message, Row, Select } from "antd";
import React, { useEffect } from "react";
import { useCreateProduct, useFinakCodeProductById, useUpdateProduct } from "../../../QueryServises/productQuery";
import { useOneCoreSetting } from "../../../QueryServises/settingQuery";
import { useGenusProductList } from "../../../QueryServises/genusQuery";
import Modal from "../../../components/Modal";
import { TreeSelect } from "antd";
import PersonalityModels from "../../../components/PesonalityModels";

const ProductModal = ({
    isOpen,
    modalMode,
    modalData,
    closeModal,
    refetch,
    productData
}) => {
    const [form] = Form.useForm();
    const { data: parentCodeId } = useFinakCodeProductById()
    const { isPending: isCreating, mutateAsync: createProduct } = useCreateProduct();
    const { isPending: isUpdating, mutateAsync: updateProduct } = useUpdateProduct();
    const { data: casingData } = useOneCoreSetting("casing");
    const { data: genusData } = useGenusProductList();


    useEffect(() => {
        if (parentCodeId) {
            setFinalCodePrefix(parentCodeId + "/");
        }
    }, [parentCodeId]);

    // مدیریت تغییرات فیلد کد نهایی
    const handleFinalCodeChange = (e) => {
        const value = e.target.value;
        if (value.startsWith(finalCodePrefix)) {
            // اگر کاربر کد پایه را تغییر داد، آن را در state ذخیره کنید
            form.setFieldsValue({ final_code: value });
        } else {
            // در غیر این صورت، کد پایه را حفظ کرده و بقیه را اضافه کنید
            form.setFieldsValue({ final_code: finalCodePrefix + value });
        }
    };

    useEffect(() => {
        console.log(modalMode);
        console.log(modalData);
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                persian_title: modalData.persian_title,
                code: modalData.code,
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
                parent_id: modalData.parent_code,
                parent_code_id: modalData.parent_code,
                casing_id: modalData.casing?.id || [],
                genus_id: modalData.genus?.id || [],
                pro_type: modalData.pro_type,
                description: modalData.description,
                brand1: modalData.brand1,
                brand1_desc: modalData.brand1_desc,
                personality_type: modalData.personality_type,
                personality_ids: modalData.product_personalities?.map(p => p.personality.id) || [],
                brand2: modalData.brand2,
                brand2_desc: modalData.brand2_desc,
                employer_code: modalData.employer_code,
                standard_code: modalData.standard_code,
                alternative_genus_id: modalData.alternative_genus?.id,
                final_code: modalData.final_code || (parentCodeId ? parentCodeId + "/" : "")

            });
        } else if (modalMode === "add") {
            form.resetFields();
            if (parentCodeId) {
                form.setFieldsValue({ final_code: parentCodeId + "/" });
            }
        } else if (modalMode === "addToParent") {
            form.resetFields(),
                form.setFieldsValue({
                    parent_id: modalData.id,
                    parent_code_id: modalData.id,
                    final_code: parentCodeId ? parentCodeId + "/" : ""

                });
        }
    }, [modalMode, modalData, form]);

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
            product_number: values.product_number,
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
            standard_code: values.standard_code,
            final_code: values.final_code,
        };

        if (modalMode === "add" || modalMode === "addToParent") {
            createProduct(payload)
                .then(() => {
                    message.success("محصول با موفقیت اضافه شد");
                    closeModal();
                })
                .catch((error) => {
                    message.error(error.response?.data?.message || "خطا در افزودن محصول");
                    console.error(error);
                });
            refetch()
        } else if (modalMode === "edit") {
            console.log(payload);

            updateProduct({
                productId: modalData.id,
                ...payload
            })

                .then(() => {
                    message.success("محصول با موفقیت ویرایش شد");
                    closeModal();
                })
                .catch((error) => {
                    message.error(error.response?.data?.message || "خطا در ویرایش محصول");
                    console.error(error);
                });
            refetch()
        }
    };

    const getTreeSelectOptions = (data, modalMode = null, modalData = null) => {
        return data.map(item => {
            const titleFields = [
                'persian_title',
                'title',
                'name',
                'label',
                'display_name',
                'code'
            ];
            let title = 'بدون عنوان';
            for (const field of titleFields) {
                if (item[field]) {
                    title = item[field];
                    if (field !== 'code' && item.code) {
                        title = `${item.code} - ${title}`;
                    }
                    break;
                }
                disabled: modalMode === "edit" && modalData && (item.id === modalData.id || item.id === modalData.parent_code)
            }
            return {
                title: title,
                value: item.id,
                children: item.children ? getTreeSelectOptions(item.children, modalMode, modalData) : [],
                disabled: modalMode === "edit" && item.id === modalData?.id
            };
        });
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
            bodyStyle={{ padding: 0 }}
            style={{ top: 20 }}
        >
            <div style={{
                maxHeight: "60vh",
                overflowY: "auto",
                padding: "0 24px"
            }}>
                <Form form={form} layout="horizontal" onFinish={onFinish}>
                    <Row gutter={[6, 0]}>
                        <Col span={8}>
                            <Form.Item name="parent_id" label="شاخه والد">
                                <TreeSelect
                                    treeData={getTreeSelectOptions(productData || [])}
                                    placeholder="شاخه والد"
                                    allowClear
                                    treeIcon={true}
                                    treeLine={true}
                                    showSearch
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="parent_code_id" label="ارث بری کد">
                                <TreeSelect
                                    showSearch
                                    placeholder="ارث بری کد"
                                    treeData={getTreeSelectOptions(productData || [])}
                                    allowClear
                                    treeIcon={true}
                                    treeLine={true}

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
                                <Input addonBefore="کد محصول" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="final_code">
                                <Input addonBefore="کد نهایی"
                                    onChange={handleFinalCodeChange}
                                />
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
                                <Input addonBefore="شرح نام تجاری2" />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="employer_code">
                                <Input addonBefore="کدکارفرما" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="standard_code">
                                <Input addonBefore="کد استاندارد" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="status">
                                <Select
                                    placeholder="وضعیت"
                                    addonBefore="وضعیت"
                                    options={[
                                        { label: 'فعال', value: 'active' },
                                        { label: 'غیرفعال', value: 'inactive' }
                                    ]}
                                />
                            </Form.Item>
                        </Col>


                        <Col span={24}>
                            <Form.Item>
                                <PersonalityModels
                                    showAlongside={true}
                                    value={modalData}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="genus_id">
                                <TreeSelect
                                    treeData={getTreeSelectOptions(genusData || [])}
                                    placeholder="جنس"
                                    allowClear
                                    treeIcon={true}
                                    treeLine={true}
                                    showSearch
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="alternative_genus_id">
                                <TreeSelect
                                    treeData={getTreeSelectOptions(genusData || [])}
                                    placeholder="جنس جایگزین"
                                    allowClear
                                    treeIcon={true}
                                    treeLine={true}
                                    showSearch
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="casing_id">
                                <TreeSelect
                                    treeData={getTreeSelectOptions(casingData || [])}
                                    placeholder="جنس"
                                    allowClear
                                    treeIcon={true}
                                    treeLine={true}
                                    showSearch
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