import { useEffect } from "react";
import Modal from "../../../../../components/Modal";
import { Button, Col, Form, Input, message, Row, Switch } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  useCreateContractorProduct,
  useUpdateContractorProduct,
} from "@/QueryServises/ProductContractorQuery/index.js";

const ContractorModal = ({
  isOpen,
  modalMode,
  modalData,
  closeModal,
  setModal,
  refetch,
}) => {
  const { mutateAsync: createContractor } = useCreateContractorProduct();
  const { mutateAsync: updateContractor } = useUpdateContractorProduct();

  const [form] = Form.useForm();

  useEffect(() => {
    if (modalMode === "edit" && modalData) {
      form.setFieldsValue({
        name: modalData.name,
        is_employer: modalData.is_employer,
        code: modalData.code,
        order: modalData.order,
      });
    } else {
      form.resetFields();
    }
  }, [modalMode, modalData, form]);

  const onFinish = async (values) => {
    const payload = {
      name: values.name,
      is_employer: values.is_employer,
      code: values.code,
      order: values.order,
    };
    try {
      if (modalMode === "add") {
        await createContractor(payload);
      } else {
        await updateContractor({ ContractorId: modalData?.id, ...payload });
      }
      message.success("با موفقیت اضافه شد");
      closeModal();
      refetch();
    } catch (error) {
      message.error("مشکلی در اضافه شدن پیش آمده است");
      console.error(error);
    }
  };

  return (
    <>
      <Button
        className="modal-button"
        icon={<PlusOutlined className="text-center" />}
        onClick={() => setModal({ mode: "add", data: null })}
      >
        <span className="xs:hidden sm:hidden md:inline">
          افزودن پیمانکار/کارفرما
        </span>
      </Button>
      <Modal
        isOpen={isOpen}
        title={`${
          modalMode === "edit" ? "ویرایش" : "افزودن"
        } پیمانکار / کارفرما `}
        size={600}
        onClose={closeModal}
        onSubmit={() => form.submit()}
        mode={modalMode}
      >
        <Form onFinish={onFinish} form={form} layout={"vertical"}>
          <Row gutter={[16, 4]}>
            <Col span={12}>
              <Form.Item name="order" label={"اولویت نمایش"}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label={"نام"}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="code" label={"کد"}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="is_employer"
                valuePropName="checked"
                label={"کارفرما"}
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

export default ContractorModal;
