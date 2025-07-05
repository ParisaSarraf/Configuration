import Modal from "@/components/Modal/index.jsx";
import {Col, Form, message, Row, Input} from "antd";
import FileUploader from "@/components/FileUploader/FileUploader.jsx";
import {useChangeActivityTrustee} from "@/QueryServises/ActivityQuery/index.js";
import {useEffect} from "react";

const TrusteeModal = ({isOpen, closeModal, modalMode, modalData, refetch}) => {
    const [form] = Form.useForm();
    useEffect(() => {
        if (modalMode === 'add') {
            form.resetFields()
        }
    }, [form, modalMode, modalData]);

    const {mutateAsync: confirmTrustee} = useChangeActivityTrustee()
    const onFinish = async (values) => {
        const formData = new FormData();
        formData.append('trustee_description', values.trustee_description || '');

        if (values.trustee_file?.[0]?.originFileObj) {
            formData.append('trustee_file', values.trustee_file[0].originFileObj);
        }

        try {
            await confirmTrustee({
                trusteeId: modalData?.id,
                trusteeData: formData
            });
            message.success('فعالیت با موفقیت توسط متولی تایید شد.')
            closeModal()
            await refetch()
        } catch (err) {
            console.log(err)
            message.error(err.message)
        }
    }
    return (
        <Modal
            title={modalMode === 'add' ? 'تایید انجام توسط متولی' : 'ویرایش انجام توسط متولی'}
            isOpen={isOpen}
            onClose={closeModal}
            size={500}
            onSubmit={() => form.submit()}
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label='توضیح' name='trustee_description'>
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label='فایل ضمیمه' name='trustee_file'>
                            <FileUploader/>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}
export default TrusteeModal