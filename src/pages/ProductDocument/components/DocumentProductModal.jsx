import {useEffect} from "react";
import Modal from "../../../components/Modal";
import {Button, Col, Form, Input, message, Row, Switch, TreeSelect} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import {useDocumentList} from "../../../QueryServises/documentQuery";
import {useCreateProductDocument, useUpdateProductDocument} from "../../../QueryServises/productDocumentQuery";
import Date from "@/components/DatePicker/Date.jsx";
import {georgianDateToJalaliDate, jalaliDateToGeorgianDate} from "@utils/timeTool.jsx";

const DocumentProductModal = ({isOpen, modalMode, modalData, closeModal, setModal, currentProduct, refetch}) => {
    const [form] = Form.useForm();
    const {isPending: isCreating, mutateAsync: createProductDocument} = useCreateProductDocument();
    const {isPending: isUpdating, mutateAsync: updateProductDocument} = useUpdateProductDocument();
    const {data: documentList} = useDocumentList();

    useEffect(() => {
        if (modalMode === "edit" && modalData) {
            form.setFieldsValue({
                is_reportable: modalData?.is_reportable,
                title: modalData?.title,
                document_id: modalData?.document?.code,
                survey_date: georgianDateToJalaliDate(modalData?.survey_date),
            });
        } else if (modalMode === "add") {
            form.resetFields()
            form.setFieldsValue({
                is_reportable: false,
                survey_date: null
            });
        }
    }, [modalMode, modalData, form]);

    const onFinishForm = async (values) => {
        const payload = {
            product_id: currentProduct?.id,
            document_id: values.document_id,
            title: values.title,
            is_reportable: values.is_reportable || false,
            survey_date: jalaliDateToGeorgianDate(values?.survey_date)
        };
        try {
            if (modalMode === "add") {
                await createProductDocument(payload);
                message.success("سند با موفقیت اضافه شد");
                refetch()
            } else {
                await updateProductDocument({documentId: modalData.id, ...payload});
                message.success("سند با موفقیت ویرایش شد");
                refetch()
            }
            refetch();
            closeModal();
        } catch (error) {
            message.error("موفقیت آمیز نبود، دوباره امتحان کنید");
            console.error("Error details:", error.response?.data);
        }
    };

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
                disabled: modalMode === "edit" && item.id === modalData?.document?.id
            };
        });
    };

    return (
        <>
            <Button
                className="modal-button"
                icon={<PlusOutlined/>}
                onClick={() => setModal({mode: "add", data: null, type: 'AddDocumentProduct'})}
            >
            </Button>
            <Modal
                isOpen={isOpen}
                title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} سند`}
                size={500}
                onClose={closeModal}
                onSubmit={() => form.submit()}
                mode={modalMode}
                loading={isCreating || isUpdating}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinishForm}
                >
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                label="عنوان سند"
                                name="title"
                                rules={[{required: true, message: "لطفاً نام را وارد کنید"}]}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="نوع سند"
                                name="document_id"
                            >
                                <TreeSelect
                                    treeData={getTreeSelectOptions(documentList || [])}
                                    placeholder="اسناد"
                                    allowClear
                                    treeIcon={true}
                                    treeLine={true}
                                    showSearch
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                                <Date
                                    label="تاریخ بررسی"
                                      name="survey_date"
                                    stringifyDate={true}
                                    noStyle
                                    isRequired
                                />
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
    );
};

export default DocumentProductModal;
