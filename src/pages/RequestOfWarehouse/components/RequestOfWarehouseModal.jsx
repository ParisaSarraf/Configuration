import Modal from "@/components/Modal/index.jsx";
import {Col, Form, InputNumber, message, Radio, Row} from "antd"
import {useCreateRequestOfWarehouse, useUpdateRequestOfWarehouse} from "@/QueryServises/RequestOfWarehouse/index.js";

const RequestOfWarehouseModal = ({isOpen, modalData, modalMode, modalType, closeModal, currentProduct}) => {
    const [form] = Form.useForm();
    const {mutateAsync: createRequestWarehouse} = useCreateRequestOfWarehouse()
    const {mutateAsync: updateRequestWarehouse} = useUpdateRequestOfWarehouse()

    const onFinish = async (values) => {
        console.log(values)
        const payload = {
            product_id: currentProduct?.id,
            request_type: values.request_type,
            quantity: values.quantity,
            support_number: values.support_number,
            state: 10,
        }
        console.log(payload)
        try {
            if (modalMode === 'add') {
                await createRequestWarehouse(payload)
                message.success("درخواست خرید کالا از انبار با موفقیت اضافه شد")
            } else {
                await updateRequestWarehouse(payload)
                message.success("درخواست خرید کالا از انبار با موفقیت ویرایش شد")
            }
            refetch()
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
            size={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Row gutter={[16, 16]}>
                    <Col span={8}>
                        <Form.Item label="تعداد" name="quantity">
                            <InputNumber className="w-full" min={1}/>
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="تعداد پشتیبانی" name='support_number'>
                            <InputNumber className="w-full" min={1}/>
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