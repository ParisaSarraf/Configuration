import Modal from "@/components/Modal/index.jsx";
import {Col, Form, Row, Select, Input, message} from "antd";
import DatepickerCustom from "@/components/DatePicker/index.jsx";
import FileUploader from "@/components/FileUploader/FileUploader.jsx";
import {useCreateMeeting, useUpdateMeeting} from "@/QueryServises/MeetingQuery/index.js";
import {useEffect} from "react";
import {BASEURL} from "@/Services/axiosInstance.js";
import {useContractorProductList} from "../../../QueryServises/ProductContractorQuery";

const MeetingsModal = ({
                           isOpen,
                           closeModal,
                           modalMode,
                           refetch,
                           currentProduct,
                           modalData = null
                       }) => {
    const [form] = Form.useForm();
    const {mutateAsync: createMeeting} = useCreateMeeting();
    const {mutateAsync: updateMeeting} = useUpdateMeeting();
    const {data: contractorData} = useContractorProductList();

    useEffect(() => {
        if (modalMode === 'edit' && modalData) {
            form.setFieldsValue({
                type: modalData?.type || '',
                title: modalData?.title || '',
                contractor_id: modalData?.contractor_id || undefined,
                date: modalData?.date || null,
                file: modalData?.file
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
        if (!currentProduct?.id) {
            message.error("Product information is missing");
            return;
        }

        const payload = {
            product_id: currentProduct.id,
            contractor_id: values.contractor_id,
            type: values.type,
            title: values.title,
            date: values.date,
            file: values.file?.[0]?.originFileObj,
        };

        try {
            if (modalMode === 'add') {
                await createMeeting(payload);
                message.success("صورتجلسه با موفقیت اضافه شد");
            } else {
                if (!modalData?.id) {
                    message.error("Meeting ID is missing");
                    return;
                }
                await updateMeeting({meetingId: modalData.id, ...payload});
                message.success("صورتجلسه با موفقیت ویرایش شد.");
            }
            await refetch();
            closeModal();
        } catch (error) {
            console.error(error);
            message.error(error.message || "خطایی رخ داده است");
        }
    };

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
                <Row gutter={[16]}>

                    <Col span={12}>
                        <Form.Item
                            name='type'
                            label='نوع'
                            initialValue={modalMode === 'edit' ? modalData?.type : undefined}
                        >
                            <Select>
                                <Select.Option value="company">شرکت</Select.Option>
                                <Select.Option value="contractor">پیمانکار</Select.Option>
                                <Select.Option value="employer">کارفرما</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label='طرف صورتجلسه'
                            name='contractor_id'
                            initialValue={modalMode === 'edit' ? modalData?.contractor_id : undefined}
                        >
                            <Select
                                allowClear={true}
                                options={contractorData?.map(item => ({
                                    label: item.name,
                                    value: item.id
                                })) || []}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            label='موضوع'
                            name='title'
                            initialValue={modalMode === 'edit' ? modalData?.title : undefined}
                        >
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            label='تاریخ'
                            name='date'
                            initialValue={modalMode === 'edit' ? modalData?.date : undefined}
                        >
                            <DatepickerCustom/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            label='فایل ضمیمه'
                            name='file'
                        >
                            <FileUploader maxFiles={1} listType="picture"/>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default MeetingsModal;