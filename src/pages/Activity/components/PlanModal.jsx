import Modal from "@/components/Modal/index.jsx";
import { Col, Form, message, Row, Input, InputNumber } from "antd";
import FileUploader from "@/components/FileUploader/FileUploader.jsx";
import { useChangePlanTrustee } from "@/QueryServises/ActivityQuery/index.js";
import { useEffect } from "react";

const PlanModal = ({ isOpen, closeModal, modalMode, modalData, refetch }) => {
    const [form] = Form.useForm();
    const { mutateAsync: confirmPlan } = useChangePlanTrustee()


    useEffect(() => {
        if (modalMode === 'add') {
            form.resetFields()
        }
    }, [form, modalMode, modalData]);


    const onFinish = async (values) => {
        const payload = {
            person_day: values.person_day,
            plan_description: values.plan_description,
            plan_file: values.plan_file?.[0]?.originFileObj
        }
        try {
            await confirmPlan({
                planId: modalData?.id,
                trusteeData: payload
            });
            message.success('فعالیت با موفقیت از طرح و برنامه تایید شد.')
            closeModal()
            await refetch()
        } catch (err) {
            console.log(err)
            message.error(err.message)
        }
    }
    return (
        <Modal
            title={modalMode === 'add' ? 'تایید طرح و برنامه' : 'ویرایش تایید ظرح و برنامه'}
            isOpen={isOpen}
            onClose={closeModal}
            size={500}
            onSubmit={() => form.submit()}
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={[16]}>
                    <Col span={24}>
                        <Form.Item label='نفر روز ' name='person_day'>
                            <InputNumber className='w-full' min={0} />
                        </Form.Item>
                    </Col>
                    <Col span={24} >
                        <Form.Item label='توضیحات' name='plan_description'>
                            <Input.TextArea />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label='فایل ضمیمه' name='plan_file'>
                            <FileUploader />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}
export default PlanModal