import { Col, Form, Input, message, Row } from "antd";
import Modal from "../../../components/Modal";
import FileUploader from "../../../components/FileUploader/FileUploader";
import {
  useCreatepProductRequirementExported,
  useUpdateProductRequirementExported,
} from "../../../QueryServises/productRequirementQuery";
import TsLazy from "../../../components/LazyTreeSelect/LazyTreeSelect";
import { useLazyProductTreeSelect } from "../../../hooks/useLazyProductTreeSelect";
import { useRootProduct } from "../../../QueryServises/productQuery";

const AcknowledgmentOfRequirement = ({
  isOpen,
  modalMode,
  modalData,
  closeModal,
  refetch,
}) => {
  const [form] = Form.useForm();
  const { data: productData } = useRootProduct();
  const { mutateAsync: createProductRequirementExported } =
    useCreatepProductRequirementExported();
  const { mutateAsync: updateProductRequirementExported } =
    useUpdateProductRequirementExported();
  const { treeData, loadChildren } = useLazyProductTreeSelect(productData);

  const onFinish = async (values) => {
    const productRequirementId = modalData?.product_requirements?.id;

    const payload = {
      product_requirement_id: productRequirementId,
      to_product_id: values.to_product_id?.value || null,
      pass_comment: values.pass_comment,
      file_1: values.file_1?.[0]?.originFileObj,
    };
    try {
      if (modalMode === "add") {
        await createProductRequirementExported(payload);
        message.success("الزام با موفقیت اضافه شد");
        await refetch();
      } else {
        if (!modalData?.id) {
          throw new Error("Missing product requirement ID for edit");
        }
        await updateProductRequirementExported({
          productRequirementExportedId: modalData.id,
          ...payload,
        });
        message.success("الزام با موفقیت ویرایش شد");
        await refetch();
      }
      closeModal();
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "موفقیت آمیز نبود، دوباره امتحان کنید";
      message.error(errorMessage);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`${modalMode === "edit" ? "ویرایش" : "تصدیق"} الزام`}
      size={600}
      onClose={closeModal}
      onSubmit={() => form.submit()}
      mode={modalMode}
    >
      <Form layout="vertical" onFinish={onFinish} form={form}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item label="محصولات" name="to_product_id">
              {/* <Select options={productList?.map((item) => {
                                return (
                                    {
                                        value: item.id,
                                        label: item.persian_title
                                    }
                                )
                            })}
                                suffixIcon={<SearchOutlined />}
                                showSearch
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().includes(input.toLowerCase())
                                }
                            /> */}
              <TsLazy
                treeData={treeData}
                loadData={loadChildren}
                labelInValue
                placeholder="شاخه والد"
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="توضیحات" name="pass_comment">
              <Input.TextArea />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="فایل ضمیمه " name="file_1">
              <FileUploader />
            </Form.Item>
          </Col>
          {/* <Col span={12}>
                        <Form.Item label="فایل ضمیمه 2">
                            <FileUploader />
                        </Form.Item>
                    </Col> */}
          {/* <Col span={24}>
                        <Form.Item label="توضیحات">
                            <Input.TextArea />
                        </Form.Item>
                    </Col> */}
        </Row>
      </Form>
    </Modal>
  );
};

export default AcknowledgmentOfRequirement;
