import Modal from "@/components/Modal/index.jsx";
import {Col, Form, message, Row, Select, Input} from "antd";
import {useCreateActivity, useUpdateActivity} from "@/QueryServises/ActivityQuery/index.js";
import {useEffect} from "react";
import TextArea from "antd/es/input/TextArea.js";
import DatepickerCustom from "@/components/DatePicker/index.jsx";
import {useGetProductMeetings} from "@/QueryServises/MeetingQuery/index.js";
import {useUserList} from "@/QueryServises/userQuery/index.js";

const ActivityModal = ({isOpen, modalData, modalMode, closeModal, refetch, currentProduct}) => {
    const [form] = Form.useForm();
    const {mutateAsync: createActivity} = useCreateActivity()
    const {mutateAsync: updateActivity} = useUpdateActivity()
    const {data: meetingData = []} = useGetProductMeetings(currentProduct?.id);
    const {data: usersData = []} = useUserList();

    const activityType = Form.useWatch('type', form);
    useEffect(() => {
        if (modalMode === 'edit' && modalData) {
            form.setFieldsValue({
                meeting_id: modalData?.meeting,
                type: modalData?.type,
                description: modalData?.description,
                from_date: modalData?.from_date,
                to_date: modalData?.to_date,
                trustee_id: modalData?.trustee_id,
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
            description: values.description,
            from_date: values.from_date,
            to_date: values.to_date,
            meeting_id: values.meeting_id,
            trustee_id: values.trustee_id,
        }
        try {
            if (modalMode === 'add') {
                await createActivity(payload)
                message.success("فعالیت با موفقیت اضافه شد")
            } else {
                await updateActivity({activityId: modalData?.id, ...payload})
                message.success("فعالیت انتخابی با موفقیت ویرایش شد")
            }
            await refetch()
            closeModal()
        } catch (error) {
            message.error(error)
            console.log(error)
        }
    }


    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            title={modalMode === "add" ? "افزودن فعالیت" : "ویرایش فعالیت"}
            onSubmit={() => form.submit()}
            size={600}
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={[16, 16]}>
                    <Col span={activityType === 'meeting' ? '12' : '24'}>
                        <Form.Item name='type' label='نوع'>
                            <Select>
                                <Select.Option value='meeting'>
                                    صورتجلسه
                                </Select.Option>
                                <Select.Option value='control project'>
                                    کنترل پروژه
                                </Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    {activityType === 'meeting' && (
                        <Col span={12}>
                            <Form.Item label='صورتجلسه' name='meeting_id'>
                                <Select options={meetingData?.map((meet) => {
                                    return {
                                        value: meet.id,
                                        label: meet.title,
                                    }
                                })}/>
                            </Form.Item>
                        </Col>
                    )
                    }
                    <Col span={24}>
                        <Form.Item label='شرح فعالیت' name='description'>
                            <TextArea/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label={'متولی انجام'} name='trustee_id'>
                            <Select options={usersData?.map((user, index) => {
                                return {
                                    value: user.id,
                                    label: user.username,
                                }
                            })}/>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label='تاریخ شروع' name='from_date'>
                            <DatepickerCustom/>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label='تاریخ پایان' name='to_date'>
                            <DatepickerCustom/>
                        </Form.Item>
                    </Col>

                </Row>
            </Form>
        </Modal>
    )
}
export default ActivityModal