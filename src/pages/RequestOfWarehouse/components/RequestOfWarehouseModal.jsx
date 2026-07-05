import Modal from "@/components/Modal/index.jsx";
import {Col, Form, InputNumber, message, Radio, Row} from "antd"
import {useCreateRequestOfWarehouse, useUpdateRequestOfWarehouse} from "@/QueryServises/RequestOfWarehouse/index.js";
import {useEffect} from "react";

const RequestOfWarehouseModal = ({isOpen, modalData, modalMode, modalType, closeModal, currentProduct, refetch}) => {
    const [form] = Form.useForm();
    const {mutateAsync: createRequestWarehouse} = useCreateRequestOfWarehouse()
    const {mutateAsync: updateRequestWarehouse} = useUpdateRequestOfWarehouse()


    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                request_type: modalData.request_type,
                quantity: modalData.quantity,
                support_number: modalData.support_number
            });
        } else {
            form.resetFields();
        }
    }, [modalMode, modalData, form]);


    const onFinish = async (values) => {
        const payload = {
            product_id: currentProduct?.id,
            request_type: values.request_type,
            quantity: values.quantity,
            support_number: values.support_number,
            state: 10,
        }
        try {
            if (modalMode === 'add') {
                await createRequestWarehouse(payload)
                message.success("درخواست خرید کالا از انبار با موفقیت اضافه شد")

            } else {
                await updateRequestWarehouse({RequestOfWarehouseId: modalData?.id, ...payload})
                message.success("درخواست خرید کالا از انبار با موفقیت ویرایش شد")

            }
            await refetch()
            closeModal()
        } catch (error) {
            message.error(error)
            console.error(error)
            throw error
        }
    }


    return (
        <Modal
            isOpen={isOpen}
            title={`${modalMode === 'add' ? 'افزودن درخواست از انبار' : 'ویرایش درخواست از انبار'}`}
            onClose={closeModal}
            onCancel={closeModal}
            onSubmit={() => form.submit()}
            size={500}
            // footer={false}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Form.Item label="تعداد" name="quantity">
                            <InputNumber className="w-full" min={0}/>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="تعداد پشتیبانی" name='support_number'>
                            <InputNumber className="w-full" min={0}/>
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item name="request_type" className="flex flex-row justify-center">
                            <Radio.Group>
                                <Radio value="construction">ساخت</Radio>
                                <Radio value="assembly">مونتاژ</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}

export default RequestOfWarehouseModal;