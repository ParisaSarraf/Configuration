import React, { useEffect } from "react";
import { Button, Col, Form, Input, message, Row } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Modal from "../../../../../components/Modal";
import {
  useCreateLifeCycle,
  useUpdateLifeCycle,
} from "../../../../../QueryServises/lifeCycleQuery";

const LifeCycleModal = ({
  isOpen,
  modalMode,
  modalData,
  closeModal,
  setModal,
  refetch,
}) => {
  const [form] = Form.useForm();
  const { isPending: isCreating, mutateAsync: createLifeCycle } =
    useCreateLifeCycle();
  const { isPending: isUpdating, mutateAsync: updateLifeCycle } =
    useUpdateLifeCycle();

  useEffect(() => {
    if (modalMode === "edit" && modalData) {
      form.setFieldsValue({
        title: modalData.title,
        tag: modalData.tag,
        order: modalData.order,
      });
    } else if (modalMode === "add") {
      form.resetFields();
    }
  }, [modalMode, modalData, form]);

  const onFinishForm = async (values) => {
    const payload = {
      title: values.title,
      tag: values.tag,
      order: values.order,
    };
    try {
      if (modalMode === "add") {
        await createLifeCycle(payload);
        message.success("چرخه عمر محصول با موفقیت اضافه شد");
        closeModal();
        refetch();
      } else {
        await updateLifeCycle({
          lifeCycleId: modalData.id,
          ...payload,
        });
        message.success("چرخه عمر محصول با موفقیت ویرایش شد");
        closeModal();
        refetch();
      }
    } catch (error) {
      console.error(error);
      if (error?.response?.status === 400) {
        message.error("چرخه عمر محصول تکراری است.");
      } else {
        message.error("مشکلی در ثبت پیش آمده است.");
      }
    }
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
        title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} چرخه عمر محصول`}
        size={600}
        onClose={closeModal}
        onSubmit={() => form.submit()}
        mode={modalMode}
        loading={isCreating || isUpdating}
      >
        <Form form={form} layout="vertical" onFinish={onFinishForm}>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="order" label="اولویت نمایش">
                <Input placeholder="اولویت نمایش" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="title" label="نام چرخه عمر محصول">
                <Input placeholder="نام چرخه عمر محصول" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="tag" label="برچسب ">
                <Input placeholder="برچسب" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default LifeCycleModal;
