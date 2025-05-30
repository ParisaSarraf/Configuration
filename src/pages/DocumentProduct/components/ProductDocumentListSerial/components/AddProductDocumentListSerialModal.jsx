import { PlusOutlined } from '@ant-design/icons'
import { Button, Col, Form, Input, Row, Switch, TreeSelect } from 'antd'
import Modal from '../../../../../components/Modal'
import DatepickerCustom from '../../../../../components/DatePicker'
import { useDocumentList } from '../../../../../QueryServises/documentQuery'

const AddProductDocumentListSerialModal = ({ isOpen, modalMode, modalData, closeModal, setModal, currentProduct }) => {
    const [form] = Form.useForm();
    const { data: documentList } = useDocumentList();
    console.log(documentList);

    const getTreeSelectOptions = (data, modalMode = null, modalData = null) => {
        return data.map(item => {
            const titleFields = [
                'persianTitle',
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
                disabled: modalMode === "edit" && item.id === modalData?.document?.id // اصلاح این خط
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
                title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} سند`}
                size={500}
                onClose={closeModal}
                // onSubmit={() => form.submit()}
                mode={modalMode}
            // loading={isCreating || isUpdating}
            >
                <Form
                    form={form}
                    layout="vertical"
                // onFinish={onFinishForm}
                >
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                label="عنوان سند"
                                name="title"
                                rules={[{ required: true, message: "لطفاً نام را وارد کنید" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="نوع سند"
                                name="document_id"
                                rules={[{ required: true, message: "لطفاً اسناد را انتخاب کنید" }]}
                            >
                                <TreeSelect
                                    treeData={getTreeSelectOptions(documentList || [])}
                                    placeholder="اسناد"
                                    allowClear
                                    treeIcon={true}
                                    treeLine={true}
                                    showSearch
                                />
                                {/* <Input /> */}
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                label="تاریخ بررسی"
                                name="survey_date"
                            >
                                <DatepickerCustom format="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label=" قابل گزارش است"
                                name="is_reportable"
                                valuePropName="checked"
                            >
                                <Switch
                                    checkedChildren="بله"
                                    unCheckedChildren="خیر"
                                    className="bg-gray-300"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    )
}

export default AddProductDocumentListSerialModal
