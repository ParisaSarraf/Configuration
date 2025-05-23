import { Checkbox, Col, Form, Input, Row, Select } from 'antd';
import Modal from '../../components/Modal'
import FileUploader from '../../components/FileUploader/FileUploader';

const DescribeTheRequirementModal = ({ isOpen, modalMode, modalData, closeModal, setModal, currentProduct }) => {
    console.log(modalMode);

    return (
        <Modal
            isOpen={isOpen}
            title={`${modalMode === "edit" ? "ویرایش" : "توصیف"} الزام`}
            size={700}
            onClose={closeModal}
            // onSubmit={() => form.submit()}
            mode={modalMode}
            // loading={isCreating || isUpdating}
            // bodyStyle={{ padding: 0 }}
            style={{ top: 20 }}
        >
            <div style={{
                maxHeight: "60vh",
                overflowY: "auto",
            }}>
                <Form layout="vertical" className="p-4">
                    <Row gutter={[24]}>
                        {/* نوع الزام */}
                        <Col span={24}>
                            <Form.Item
                                label="نوع الزام"
                                name="requirementType"
                                rules={[{ required: true, message: 'لطفا نوع الزام را انتخاب کنید' }]}
                            >
                                <Select placeholder="انتخاب کنید">
                                    <Select.Option value="technical">فنی</Select.Option>
                                    <Select.Option value="safety">ایمنی</Select.Option>
                                    <Select.Option value="quality">کیفیت</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        {/* توصیف و کد الزام */}
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="توصیف الزام"
                                name="description"
                                rules={[{ required: true, message: 'لطفا توصیف الزام را وارد کنید' }]}
                            >
                                <Input placeholder="توضیحات الزام" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="کد الزام"
                                name="code"
                                rules={[{ required: true, message: 'لطفا کد الزام را وارد کنید' }]}
                            >
                                <Input placeholder="مثل: REQ-001" />
                            </Form.Item>
                        </Col>

                        {/* فایل پیوست و توضیحات */}
                        <Col span={24}>
                            <Form.Item
                                label="فایل پیوست"
                                name="attachment"
                                extra="حداکثر حجم فایل 10MB"
                            >
                                <FileUploader
                                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                                    maxSize={10 * 1024 * 1024}
                                />
                            </Form.Item>

                            <Form.Item
                                label="توضیحات تکمیلی"
                                name="notes"
                            >
                                <Input.TextArea rows={4} placeholder="هرگونه توضیح اضافی..." />
                            </Form.Item>
                        </Col>

                        {/* نقش‌ها */}
                        <Col span={24}>
                            <div className="flex flex-wrap gap-4 mb-4">
                                <Form.Item name="preparer" valuePropName="checked">
                                    <Checkbox>تهیه کننده</Checkbox>
                                </Form.Item>
                                <Form.Item name="reviewer" valuePropName="checked">
                                    <Checkbox>بازبین</Checkbox>
                                </Form.Item>
                                <Form.Item name="approver" valuePropName="checked">
                                    <Checkbox>تصویب کننده</Checkbox>
                                </Form.Item>
                            </div>
                        </Col>

                        {/* محل‌های امضا */}
                        {['تهیه کننده', 'بازبین', 'تصویب کننده'].map((title, index) => (
                            <Col xs={24} md={8} key={index}>
                                <Form.Item
                                    label={`امضای ${title}`}
                                    name={`signature_${index}`}
                                >
                                    <FileUploader
                                        accept="image/*,.pdf"
                                        title={`بارگذاری امضای ${title}`}
                                    />
                                </Form.Item>
                            </Col>
                        ))}
                    </Row>
                </Form>
            </div>
        </Modal>
    )
}

export default DescribeTheRequirementModal
