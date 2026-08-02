import { PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, message, Row, TreeSelect } from "antd";
import Modal from "../../../../../components/Modal/index.jsx";
import FileUploader from "../../../../../components/FileUploader/FileUploader.jsx";
import { useEffect } from "react";
import {
  useAvailableProductEditionList,
  useCreateProductEditionlog,
  useUpdateProductEditionlog,
} from "@/QueryServises/productDocumentEditionLogQuery/index.js";
import { BASEURL } from "@/Services/axiosInstance.js";
import Date from "../../../../../components/DatePicker/Date.jsx";
import {
  georgianDateToJalaliDate,
  jalaliDateToGeorgianDate,
} from "@utils/timeTool.jsx";

const AddProductDocumentListSerialLogModal = ({
  isOpen,
  modalMode,
  modalData,
  closeModal,
  setModal,
  serialId,
  refetchSerialId,
  serialLabel,
}) => {
  const [form] = Form.useForm();
  const { data: documentList, isLoading } =
    useAvailableProductEditionList(serialId);
  const { mutateAsync: createProductEditionlog } = useCreateProductEditionlog();
  const { mutateAsync: updateProductEditionlog } = useUpdateProductEditionlog();

  useEffect(() => {
    if (serialId) {
      form.setFieldsValue({ serialId: serialId });
    }
    if (modalMode === "edit" && modalData) {
      form.setFieldsValue({
        document_edition_id: modalData?.data?.product_document_edition?.edition,
        survey_date: georgianDateToJalaliDate(modalData?.data?.survey_date),
        file: modalData?.data?.file
          ? [
              {
                uid: "-4",
                name: "file",
                url: BASEURL.replace("/api/v1", "") + modalData?.data.file,
              },
            ]
          : [],
      });
    } else {
      form.resetFields();
    }
  }, [form, modalData, modalMode]);

  const onFinish = async (values) => {
    const payload = {
      product_document_edition_id: values.document_edition_id,
      product_serial_id: serialId,
      survey_date: jalaliDateToGeorgianDate(values?.survey_date),
      status: 10,
      file: values.file?.[0]?.originFileObj,
    };
    try {
      if (modalMode === "add") {
        await createProductEditionlog(payload);
        message.success("سند با موفقیت اضافه شد");
      } else {
        await updateProductEditionlog({
          EditionLogId: modalData?.key,
          ...payload,
        });
        message.success("سند با موفقیت ویرایش شد");
      }
      await refetchSerialId();
      closeModal();
    } catch (error) {
      message.error("موفقیت آمیز نبود، دوباره امتحان کنید");
      console.error("Error details:", error.response?.data);
    }
  };

  const treeData = (documentList || []).flatMap(
    (item) =>
      item?.editions?.map((edition) => ({
        value: edition.id,
        title: `${item?.document?.persianTitle || ""} - ${edition.edition}`,
      })) || [],
  );

  return (
    <>
      <Button
        className="modal-button"
        icon={<PlusOutlined />}
        onClick={() =>
          setModal({ mode: "add", data: null, type: "AddLogEdition" })
        }
      ></Button>
      <Modal
        isOpen={isOpen}
        title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} اسناد log`}
        size={500}
        onClose={closeModal}
        onSubmit={() => form.submit()}
        mode={modalMode}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ serialId: serialId }}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="نوع سند"
                name="document_edition_id"
                rules={[
                  {
                    required: true,
                    message: "لطفاً سند قابل ادیت را انتخاب کنید",
                  },
                ]}
              >
                <TreeSelect
                  treeData={treeData}
                  placeholder="اسناد"
                  allowClear
                  treeLine={true}
                  showSearch
                  loading={isLoading}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="سریال محصول">
                <Input disabled value={serialLabel} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Date
                stringifyDate={true}
                noStyle
                isRequired
                label="تاریخ تهیه"
                name="survey_date"
              />
            </Col>
            <Col span={24}>
              <Form.Item label="بارگذاری فایل" name="file">
                <FileUploader maxCount={1} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default AddProductDocumentListSerialLogModal;
