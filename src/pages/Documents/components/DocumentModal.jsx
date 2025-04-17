import { useEffect } from "react";
import Modal from "../../../components/Modal";
import { Button, Col, Form, Input, message, Row, Select, Switch } from "antd";
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
        code: modalData.code,
        persianTitle: modalData.persianTitle,
        englishTitle: modalData.englishTitle,
        tagId: modalData.tag.title,
        isUsable: modalData.isUsable,
        isReproducible: modalData.isReproducible,
        parentId: modalData.parent_id,
      });
    } else if (modalMode === "add") {
      form.resetFields();
    }
  }, [modalMode, modalData, form]);

  const onFinishForm = async (values) => {
    const payload = {
      code: values.code,
      persianTitle: values.persianTitle,
      englishTitle: values.englishTitle,
      tag_id: values.tagId,
      isUsable: values.isUsable,
      isReproducible: values.isReproducible,
      ...(values.parentId !== undefined && { parent_id: values.parentId })

    };

    try {
      if (modalMode === "add") {
        await createDocument(payload);
        message.success("سند با موفقیت اضافه شد");
      } else {
        await updateDocument({ documentId: modalData.id, ...payload });
        message.success("سند با موفقیت ویرایش شد");
      }
      await refetch();
      closeModal();
    } catch (error) {
      message.error("موفقیت آمیز نبود، دوباره امتحان کنید");
      console.error("Error details:", error.response?.data);
    }
  };

  const getParentOptions = () => {
    if (!documentData) return [];

    const flattenDocumentList = (items) => {
      let result = [];
      items.forEach(item => {
        result.push({
          id: item.id,
          persianTitle: item.persianTitle,
          parentId: item.parentId
        });
        if (item.children && item.children.length > 0) {
          result = result.concat(flattenDocumentList(item.children));
        }
      });
      return result;
    };

    const allDocuments = flattenDocumentList(documentData);

    return allDocuments
      .filter(document => {
        if (modalMode === "edit") {
          if (document.id === modalData?.id) return false;

          const isChildOfCurrent = (items, targetId) => {
            return items.some(item => {
              if (item.id === targetId) return true;
              if (item.children && item.children.length > 0) {
                return isChildOfCurrent(item.children, targetId);
              }
              return false;
            });
          };
          return !isChildOfCurrent([modalData], document.id);
        }
        return true;
      })
      .map(document => ({
        label: document.persianTitle,
        value: document.id,
        disabled: modalMode === "edit" && document.id === modalData?.parentId
      }));
  };

  return (
    <>
      <Button
        className="modal-button"
        icon={<PlusOutlined className="text-center" />}
        onClick={() => setModal({ mode: "add", data: null })}
      >
        <span className="xs:hidden sm:hidden md:inline">افزودن سند</span>
      </Button>
      <Modal
        isOpen={isOpen}
        title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} سند`}
        size={700}
        onClose={closeModal}
        onSubmit={() => form.submit()}
        mode={modalMode}
        loading={isCreating || isUpdating}
      >
        <Form form={form} layout="vertical" className="p-4" onFinish={onFinishForm}>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} md={6} lg={6}>
              <Form.Item
                label="شاخه والد"
                name="parentId"
              >
                <Select
                  showSearch
                  placeholder="محصول والد را انتخاب کنید"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={getParentOptions()}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item
                label="کد"
                name="code"
                rules={[{ required: true, message: "لطفاً کد را وارد کنید" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label="نام فارسی"
                name="persianTitle"
                rules={[{ required: true, message: "لطفاً نام فارسی را وارد کنید" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label="نام انگلیسی"
                name="englishTitle"
                rules={[{ required: true, message: "لطفاً نام انگلیسی را وارد کنید" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label="چرخه حیات"
                name="tagId"
                rules={[{ required: true, message: "لطفاً نام انگلیسی را وارد کنید" }]}
              >
                <Select
                  showSearch
                  placeholder="چرخه حیات"
                  options={lifeCycleList?.map(lifecycle => ({
                    label: `${lifecycle.title}`,
                    value: lifecycle.id
                  }))}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item label="قابل قبول" name="isUsable" valuePropName="checked">
                <Switch checkedChildren="بله" unCheckedChildren="خیر" className="bg-gray-300" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item label="قابل تولید" name="isReproducible" valuePropName="checked">
                <Switch checkedChildren="بله" unCheckedChildren="خیر" className="bg-gray-300" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default DocumentModal;
