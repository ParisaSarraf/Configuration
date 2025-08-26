
import { useEffect } from "react";
import Modal from "../../../components/Modal";
import { Button, Col, Form, Input, message, Row, Select, Switch, TreeSelect } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  useCreateDocument,
  useUpdateDocument,
  useDocumentList,
} from "../../../QueryServises/documentQuery";
import { useLifeCycleList } from "../../../QueryServises/lifeCycleQuery";

const DocumentModal = ({ isOpen, modalMode, modalData, closeModal, setModal, documentData }) => {
  const [form] = Form.useForm();
  const { isPending: isCreating, mutateAsync: createDocument } = useCreateDocument();
  const { isPending: isUpdating, mutateAsync: updateDocument } = useUpdateDocument();
  const {
    data: lifeCycleList,
  } = useLifeCycleList();
  const { refetch } = useDocumentList();

  useEffect(() => {

    if (modalMode === "edit" && modalData) {
      form.setFieldsValue({
        parent_id: modalData.parent,
        code: modalData.code,
        persianTitle: modalData.title,
        englishTitle: modalData.englishTitle,
        tag_id: modalData?.tag?.id,
        isUsable: modalData.isUsable,
        log: modalData.log,
      });
    } else if (modalMode === "add") {
      form.resetFields();
    }
  }, [modalMode, modalData, form]);

  const onFinishForm = async (values) => {

    const payload = {
      parent_id: values.parent_id,
      code: values.code,
      persianTitle: values.persianTitle,
      englishTitle: values.englishTitle,
      tag_id: values.tag_id,
      isUsable: values.isUsable,
      log: values.log,
    };

    try {
      if (modalMode === "add") {
        await createDocument(payload);
        message.success("سند با موفقیت اضافه شد");
      } else if (modalMode === "edit") {

        await updateDocument({ documentId: modalData.id, ...payload });
        message.success("سند با موفقیت ویرایش شد");
      }
      await refetch();
      closeModal();
    } catch (error) {
      message.error("موفقیت آمیز نبود، دوباره امتحان کنید");
      console.error("Error details:", error?.response?.data || error.message || error);
    }
  };

  const getTreeSelectOptions = (data, modalMode = null, modalData = null) => {
    return data.map(item => {
      const titleFields = [
        'persianTitle',
        'title',
        'name',
        'label',
        'display_name',
        'code'
      ];
      let title = 'بدون عنوان';
      for (const field of titleFields) {
        if (item[field]) {
          title = item[field];
          if (field !== 'code' && item.code) {
            title = `${item.code} - ${title}`;
          }
          break;
        }
        modalMode === "edit" && modalData && (item.id === modalData.id || item.id === modalData.parent_code)
      }
      return {
        title: title,
        value: item.id,
        children: item.children ? getTreeSelectOptions(item.children, modalMode, modalData) : [],
        disabled: modalMode === "edit" && item.id === modalData?.id
      };
    });
  };


  return (
    <>
      <Button
        className="modal-button"
        icon={<PlusOutlined className="text-center" />}
        onClick={() => setModal({ mode: "add", data: null })}
      />
      <Modal
        isOpen={isOpen}
        title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} سند`}
        size={600}
        onClose={closeModal}
        onSubmit={() => form.submit()}
        mode={modalMode}
        loading={isCreating || isUpdating}
        className=""
      >

        <Form
          form={form}
          layout="vertical"
          className="p-4"
          onFinish={onFinishForm}
        >
          <Row gutter={[24, 16]}>
            <Col span={12}>
              <Form.Item
                layout="vertical"
                label="شاخه والد"
                name="parent_id"
                tooltip="محصول والد را انتخاب کنید"
              >
                <TreeSelect
                  treeData={getTreeSelectOptions(documentData || [])}
                  placeholder="انتخاب کنید..."
                  allowClear
                  treeIcon={true}
                  treeLine={true}
                  showSearch
                />

              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="کد سند"
                layout="vertical"

                name="code"
                rules={[{
                  required: true,
                  message: "لطفاً کد سند را وارد کنید"
                }]}
              >
                <Input placeholder="مثال: PRD-001" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="نام فارسی"
                layout="vertical"
                name="persianTitle"
                rules={[{
                  required: true,
                  message: "لطفاً نام فارسی محصول را وارد کنید"
                }]}
              >
                <Input placeholder="نام فارسی محصول" />
              </Form.Item>
            </Col>


            <Col span={12}>
              <Form.Item
                label="نام انگلیسی"
                name="englishTitle"
                layout="vertical"

                rules={[{
                  required: true,
                  message: "لطفاً نام انگلیسی محصول را وارد کنید",
                  pattern: {
                    value: /^[a-zA-Z\s]+$/,
                    message: "فقط حروف انگلیسی مجاز است"
                  }
                }]}
              >
                <Input placeholder="English product name" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                layout="vertical"
                label="چرخه عمر محصول"
                name="tag_id"
              >
                <Select
                  showSearch
                  placeholder="انتخاب چرخه عمر..."
                  options={lifeCycleList?.map(lifecycle => ({
                    label: lifecycle.title,
                    value: lifecycle.id
                  }))}
                  allowClear
                />
              </Form.Item>
            </Col>
            {/* <Col span={12}>
                <Form.Item
                  layout="vertical"
                  label="تاریخ تهیه سند"
                  name="DocumentDate"

                // rules={[{
                //   required: true,
                //   message: "لطفاً نام فارسی محصول را وارد کنید"
                // }]}
                >
                  <DatepickerCustom />
                </Form.Item>
              </Col> */}

            <Col span={12}>
              <Form.Item
                label="Doc"
                name="isUsable"
                valuePropName="checked"
                tooltip="آیا این سند قابل استفاده است؟"
              >
                <Switch
                  checkedChildren="بله"
                  unCheckedChildren="خیر"
                  className="bg-gray-300"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Log"
                name="log"
                valuePropName="checked"
                tooltip="آیا این سند قابل تولید مجدد است؟"
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

export default DocumentModal;