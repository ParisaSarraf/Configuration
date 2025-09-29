import Modal from "@/components/Modal/index.jsx";
import {Col, Form, message, Row, Select} from "antd";
import {useCreateActivity, useUpdateActivity} from "@/QueryServises/ActivityQuery/index.js";
import {useEffect} from "react";
import TextArea from "antd/es/input/TextArea.js";
import {useGetProductMeetings} from "@/QueryServises/MeetingQuery/index.js";
import {useUserSimple} from "../../../QueryServises/userQuery";
import {georgianDateToJalaliDate, jalaliDateToGeorgianDate} from "@utils/timeTool.jsx";
import Date from "@/components/DatePicker/Date.jsx";

const ActivityModal = ({isOpen, modalData, modalMode, closeModal, refetch, currentProduct, modalType}) => {
    const [form] = Form.useForm();
    const {mutateAsync: createActivity} = useCreateActivity()
    const {mutateAsync: updateActivity} = useUpdateActivity()
    const {data: meetingData = []} = useGetProductMeetings(currentProduct?.id);
    const {data: usersData = []} = useUserSimple();

    const activityType = Form.useWatch('type', form);
    useEffect(() => {
        if (modalMode === 'edit' && modalData) {
            form.setFieldsValue({
                meeting_id: modalData?.meeting,
                type: modalData?.type,
                description: modalData?.description,
                from_date: georgianDateToJalaliDate(modalData?.from_date),
                to_date: georgianDateToJalaliDate(modalData?.to_date),
                trustee_id: modalData?.trustee?.id,
            });
        } else {
            form.resetFields();
        }
    }, [form, modalMode, modalData]);


    const onFinish = async (values) => {
        const payload = {
            type: values.type,
            description: values.description,
            from_date: jalaliDateToGeorgianDate(values?.from_date),
            to_date: jalaliDateToGeorgianDate(values?.to_date),
            meeting_id: modalType === 'addActivitiesMeetings' ? modalData?.id : values.meeting_id,
            trustee_id: values.trustee_id,
        };

        if (values.type === 'control project') {
            payload.product_id = currentProduct?.id;
        }

        try {
            if (modalMode === 'add') {
                await createActivity(payload);
                message.success("فعالیت با موفقیت اضافه شد");
            } else {
                await updateActivity({activityId: modalData?.id, ...payload});
                message.success("فعالیت انتخابی با موفقیت ویرایش شد");
            }
            await refetch();
            closeModal();
        } catch (error) {
            message.error(error);
            // console.log(error);
        }
    };


    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            title={modalMode === "add" ? "افزودن فعالیت" : "ویرایش فعالیت"}
            onSubmit={() => form.submit()}
            size={500}
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                    {modalType === 'addActivity' && (
                        <>
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
                                        <Select

                                            options={meetingData?.map((meet) => {
                                            return {
                                                value: meet.id,
                                                label: `${meet.title}`,
                                            }
                                        })}/>
                                    </Form.Item>
                                </Col>
                            )
                            }
                        </>
                    )}

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
                                    label: `${user.name} ${user.last_name} `,
                                }
                            })}/>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Date
                        //     rules={[
                        //         {required: true, message: 'لطفا تاریخ شروع را وارد کنید'},
                        // ({getFieldValue}) => ({
                        //     validator(_, value) {
                        //     const toDate = getFieldValue('to_date');
                        //     if (!value || !toDate || new Date(value) <= new Date(toDate)) {
                        //     return Promise.resolve();
                        // }
                        //     return Promise.reject(new Error('تاریخ شروع باید قبل از تاریخ پایان باشد'));
                        // },
                        // })]}
                            stringifyDate={true}
                            noStyle
                            isRequired name={'from_date'}  label='تاریخ شروع'/>
                    </Col>
                    <Col span={12}>
                            <Date
                                stringifyDate={true}
                                noStyle
                                isRequired
                                  label='تاریخ پایان'
                                  name='to_date'
                                // rules={[
                                //     {required: true, message: 'لطفا تاریخ پایان را وارد کنید'},
                                //     ({getFieldValue}) => ({
                                //         validator(_, value) {
                                //             const fromDate = getFieldValue('from_date');
                                //             if (!value || !fromDate || new Date(fromDate) <= new Date(value)) {
                                //                 return Promise.resolve();
                                //             }
                                //             return Promise.reject(new Error('تاریخ پایان باید بعد از تاریخ شروع باشد'));
                                //         },
                                //     }),
                                // ]}
                            />

                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}
export default ActivityModal