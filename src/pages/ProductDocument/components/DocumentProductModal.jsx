import { useEffect } from "react";
import Modal from "../../../components/Modal";
import { Col, Form, Input, message, Row, Switch } from "antd";
import { useDocumentList } from "../../../QueryServises/documentQuery";
import {
  useCreateProductDocument,
  useUpdateProductDocument,
} from "../../../QueryServises/productDocumentQuery";
import Date from "@/components/DatePicker/Date.jsx";
import {
  georgianDateToJalaliDate,
  jalaliDateToGeorgianDate,
} from "@utils/timeTool.jsx";
import TS from "../../../components/TreeSelect";

const DocumentProductModal = ({
  isOpen,
  modalMode,
  modalData,
  closeModal,
  currentProduct,
  refetch,
}) => {
  const [form] = Form.useForm();
  const { isPending: isCreating, mutateAsync: createProductDocument } =
    useCreateProductDocument();
  const { isPending: isUpdating, mutateAsync: updateProductDocument } =
    useUpdateProductDocument();
  const { data: documentList } = useDocumentList();

  useEffect(() => {
    if (modalMode === "edit" && modalData) {
      form.setFieldsValue({
        is_reportable: modalData?.is_reportable,
        title: modalData?.title,
        document_id: modalData?.documentId
          ? {
              value: modalData?.documentId,
              label: modalData?.documentTitle,
            }
          : null,
        survey_date: georgianDateToJalaliDate(modalData?.survey_date),
      });
    } else if (modalMode === "add") {
      form.resetFields();
      form.setFieldsValue({
        is_reportable: false,
        survey_date: null,
      });
    }
  }, [modalMode, modalData, form]);

  const onFinishForm = async (values) => {
    const payload = {
      product_id: currentProduct?.id,
      document_id: values.document_id?.value,
      title: values.title,
      is_reportable: values.is_reportable || false,
      survey_date: jalaliDateToGeorgianDate(values?.survey_date),
    };
    try {
      if (modalMode === "add") {
        await createProductDocument(payload);
        message.success("سند با موفقیت اضافه شد");
        refetch();
      } else {
        await updateProductDocument({ documentId: modalData.id, ...payload });
        message.success("سند با موفقیت ویرایش شد");
        refetch();
      }
      refetch();
      closeModal();
    } catch (error) {
      message.error("موفقیت آمیز نبود، دوباره امتحان کنید");
      console.error("Error details:", error.response?.data);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} سند`}
        size={500}
        onClose={closeModal}
        onSubmit={() => form.submit()}
        mode={modalMode}
        loading={isCreating || isUpdating}
      >
        <Form form={form} layout="vertical" onFinish={onFinishForm}>
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
              <Form.Item label="نوع سند" name="document_id">
                <TS
                  labelInValue
                  data={documentList || []}
                  placeholder="اسناد"
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Date
                label="تاریخ بازبینی"
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
