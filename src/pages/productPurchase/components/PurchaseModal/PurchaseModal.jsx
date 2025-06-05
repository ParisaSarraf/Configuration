import { PlusOutlined } from "@ant-design/icons"
import { Button, Checkbox, Col, Form, Input, InputNumber, message, Radio, Row } from "antd"
import Modal from "../../../../components/Modal"
import { useCreateProductPurchase, useUpdateProductPurchase } from "../../../../QueryServises/productPurchase";
import { useEffect } from "react";

const PurchaseModal = ({ isOpen, modalMode, modalData, closeModal, currentProduct, refetch }) => {
    const [form] = Form.useForm();
    const { mutateAsync: createProductPurchase } = useCreateProductPurchase();
    const { mutateAsync: updateProductPurchase } = useUpdateProductPurchase();

    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                purchase_type: modalData.purchase_type,
                quantity: modalData.quantity,
                charge_percentage: modalData.charge_percentage,
                support_number: modalData.support_number
            });
        } else {
            form.resetFields();
        }
    }, [modalMode, modalData, form]);



    const onFinish = async (values) => {
        const payload = {
            product_id: currentProduct?.id,
            purchase_type: values.purchase_type,
            quantity: values.quantity,
            charge_percentage: values.charge_percentage,
            support_number: values.support_number,
            state: 10
        }
        try {
            if (modalMode === "add") {
                await createProductPurchase(payload);
                message.success("سند با موفقیت اضافه شد");
                refetch()
            } else {
                await updateProductPurchase({ productPurchaseId: modalData.id, ...payload });
                message.success("سند با موفقیت ویرایش شد");
                refetch()
            }
            refetch();
            closeModal();
        } catch (error) {
            message.error("موفقیت آمیز نبود، دوباره امتحان کنید");
            console.error("Error details:", error.response?.data);
        }
    }

    return (
        <>
            <Modal
                isOpen={isOpen}
                title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} خرید`}
                size={500}
                onClose={closeModal}
                onSubmit={() => form.submit()}
                mode={modalMode}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Row gutter={[16, 16]}>
                        <Col span={8}>
                            <Form.Item label="تعداد" name="quantity">
                                <InputNumber className="w-full" min={1} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="درصد شارژ مونتاژ"
                                name="charge_percentage"
                                rules={[
                                    {
                                        type: 'number',
                                        min: 0,
                                        max: 100,
                                        message: 'درصد باید بین ۰ تا ۱۰۰ باشد!'
                                    }
                                ]}
                            >
                                <InputNumber
                                    className="w-full"
                                    min={0}
                                    max={100}
                                    formatter={(value) => `${value}%`}
                                    parser={(value) => value.replace('%', '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="تعداد پشتیبانی" name='support_number'>
                                <InputNumber className="w-full" min={1} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="purchase_type" className="flex flex-row justify-center">
                                <Radio.Group>
                                    <Radio value="construction">ساخت</Radio>
                                    <Radio value="assembly">مونتاژ</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal >
        </>
    )
}

export default PurchaseModal
