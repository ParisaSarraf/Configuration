import Modal from "@/components/Modal/index.jsx";
import {Col, Form, Row, Select, Input, message} from "antd";
import DatepickerCustom from "@/components/DatePicker/index.jsx";
import FileUploader from "@/components/FileUploader/FileUploader.jsx";
import {useCreateMeeting, useUpdateMeeting} from "@/QueryServises/MeetingQuery/index.js";
import {useEffect} from "react";
import {BASEURL} from "@/Services/axiosInstance.js";

const MeetingsModal = ({isOpen, closeModal, modalMode, refetch, currentProduct, modalData}) => {
    const [form] = Form.useForm();
    const {mutateAsync: createMeeting} = useCreateMeeting()
    const {mutateAsync: updateMeeting} = useUpdateMeeting()


    useEffect(() => {
        if (modalMode === 'edit' && modalData) {
            form.setFieldsValue({
                type: modalData?.type,
                title: modalData?.title,
                date: modalData?.date,
                file: modalData.file
                    ? [
                        {
                            uid: "-1",
                            name: "file",
                            url: BASEURL.replace("/api/v1", "") + modalData.file,
                        },
                    ]
                    : [],
            });
        } else {
            form.resetFields();
        }
    }, [form, modalMode, modalData]);

    const onFinish = async (values) => {
        console.log(values);
        const payload = {
            product_id: currentProduct?.id,
            type: values.type,
            title: values.title,
            date: values.date,
            file: values.file?.[0]?.originFileObj,
        }
        console.log(payload)
        try {
            if (modalMode === 'add') {
                await createMeeting(payload)
                message.success("صورتجلسه با موفقیت اضافه شد")
            } else {
                await updateMeeting({meetingId: modalData?.id, ...payload})
                message.success("صورتجلسه با موفقیت ویرایش شد.")
            }
            refetch()
            closeModal()
        } catch (error) {
            console.log(error)
            message.error(error.message)
        }
    }
    return (
        <Modal
            isOpen={isOpen}
            title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} صورتجلسه`}
            size={500}
            onClose={closeModal}
            onSubmit={() => form.submit()}
            mode={modalMode}
        >
            <Form layout="vertical" onFinish={onFinish} form={form}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Form.Item label='نوع' name='type'>
                            <Select>
                                <Select.Option value="internal">داخلی</Select.Option>
                                <Select.Option value="external">خارجی</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label='موضوع' name='title'>
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label='تاریخ' name='date'>
                            <DatepickerCustom/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label='فایل ضمیمه' name='file'>
                            <FileUploader/>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}

export default MeetingsModal