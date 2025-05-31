import { PlusOutlined } from '@ant-design/icons'
import { Button, Checkbox, Col, Form, Input, Row, TreeSelect } from 'antd'
import Modal from '../../../../../components/Modal'
import DatepickerCustom from '../../../../../components/DatePicker'
import FileUploader from '../../../../../components/FileUploader/FileUploader'
import { useEffect } from 'react'
import { useAvailableProductEditionList } from '../../../../../QueryServises/productDocumentEditionLogQuery'

const AddProductDocumentListSerialLogModal = ({ isOpen, modalMode, modalData, closeModal, setModal, currentProduct, serialId }) => {
    const [form] = Form.useForm();
    const { data: documentList } = useAvailableProductEditionList(serialId);

    console.log(documentList);

    useEffect(() => {
        if (modalMode === 'add' && modalData) {
            form.setFieldValue({

            })
        } else {
            form.resetFields()
        }
    }, [form, modalData])

    const onFinish = (values) => {
        const payload = {
            product_document_edition_id: values.document_edition_id,
            product_serial_id: serialId,
            survey_date: values.survey_date,
            status: 10,
            file: values.file?.[0]?.originFileObj
        }
        console.log(payload);

    }

    const getTreeSelectOptions = (data, modalMode = null, modalData = null) => {
        return data.map(item => {
            const titleFields = [
                'edition',
            ];
            let title = 'بدون عنوان';
            for (const field of titleFields) {
                if (item[field]) {
                    title = item[field];
                    if (field !== 'code' && item.code) {
                        title = ` ${title}`;
                    }
                    break;
                }
            }
            return {
                title: title,
                value: item.id,
                children: item.children ? getTreeSelectOptions(item.children, modalMode, modalData) : [],
                // disabled: modalMode === "edit" && item.id === modalData?.document?.id 
            };
        });
    };

    return (
        <>
            <Button
                icon={<PlusOutlined />}
                onClick={() => setModal({ mode: "add", data: null, type: 'add' })}
            >
            </Button>
            <Modal
                isOpen={isOpen}
                title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} اسناد log `}
                size={500}
                onClose={closeModal}
                onSubmit={() => form.submit()}
                mode={modalMode}
            // loading={isCreating || isUpdating}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Form.Item
                                label="نوع سند"
                                name="document_edition_id"
                                rules={[{ required: true, message: "لطفاً سند قابل ادیت را انتخاب کنید" }]}
                            >
                                {/* <TreeSelect
                                    treeData={getTreeSelectOptions(documentList[0]?.editions || [])}
                                    placeholder="اسناد"
                                    allowClear
                                    treeIcon={true}
                                    treeLine={true}
                                    showSearch
                                /> */}
                                {/* <Input /> */}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="سریال محصول"
                                name="document_id"
                                rules={[{ required: true, message: "سریال محصول انتخاب نشده است." }]}
                            >
                                <Input disabled value={serialId} />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                label="تاریخ تهیه"
                                name="survey_date"
                            >
                                <DatepickerCustom format="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="بارگذاری فایل"
                                name="file"
                            >
                                <FileUploader maxCount={1} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="تهیه"
                                name="is_reportable"
                            >
                                <Checkbox />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="بازنگری"
                                name="is_reportable"
                            >
                                <Checkbox />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="تصدیق"
                                name="is_reportable"
                            >
                                <Checkbox />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    )
}

export default AddProductDocumentListSerialLogModal
